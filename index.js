// index.js
import { Command } from "commander";
import AWS from "aws-sdk";
import fs from "fs/promises";
import os from "os";
import path from "path";
import yaml from "js-yaml";

// AWS SDK clients
const ec2 = new AWS.EC2();
const configPath = path.join(os.homedir(), ".vpnrc.yml");

// Command line interface setup
const program = new Command();

// VPN Management class
class VPNManager {
  constructor() {
    this.config = null;
  }

  async loadConfig() {
    try {
      const fileContent = await fs.readFile(configPath, "utf8");
      this.config = yaml.load(fileContent);
    } catch (error) {
      if (error.code === "ENOENT") {
        this.config = { vpns: {} };
        await this.saveConfig();
      } else {
        throw error;
      }
    }
  }

  async saveConfig() {
    const yamlStr = yaml.dump(this.config);
    await fs.writeFile(configPath, yamlStr, "utf8");
  }

  async createVPN(name, region, cidrBlock) {
    // Set AWS region
    AWS.config.update({ region });

    try {
      // Create VPC
      const vpc = await ec2
        .createVpc({
          CidrBlock: cidrBlock,
          TagSpecifications: [
            {
              ResourceType: "vpc",
              Tags: [{ Key: "Name", Value: `vpn-${name}` }],
            },
          ],
        })
        .promise();

      // Create Virtual Private Gateway
      const vgw = await ec2
        .createVpnGateway({
          Type: "ipsec.1",
          TagSpecifications: [
            {
              ResourceType: "vpn-gateway",
              Tags: [{ Key: "Name", Value: `vgw-${name}` }],
            },
          ],
        })
        .promise();

      // Attach VGW to VPC
      await ec2
        .attachVpnGateway({
          VpcId: vpc.Vpc.VpcId,
          VpnGatewayId: vgw.VpnGateway.VpnGatewayId,
        })
        .promise();

      // Save to config
      this.config.vpns[name] = {
        region,
        vpcId: vpc.Vpc.VpcId,
        vgwId: vgw.VpnGateway.VpnGatewayId,
        cidrBlock,
        status: "active",
      };

      await this.saveConfig();
      return this.config.vpns[name];
    } catch (error) {
      console.error("Error creating VPN:", error);
      throw error;
    }
  }

  async deleteVPN(name) {
    if (!this.config.vpns[name]) {
      throw new Error(`VPN "${name}" not found`);
    }

    const vpn = this.config.vpns[name];
    AWS.config.update({ region: vpn.region });

    try {
      // Detach and delete Virtual Private Gateway
      await ec2
        .detachVpnGateway({
          VpcId: vpn.vpcId,
          VpnGatewayId: vpn.vgwId,
        })
        .promise();

      await ec2
        .deleteVpnGateway({
          VpnGatewayId: vpn.vgwId,
        })
        .promise();

      // Delete VPC
      await ec2
        .deleteVpc({
          VpcId: vpn.vpcId,
        })
        .promise();

      // Remove from config
      delete this.config.vpns[name];
      await this.saveConfig();
    } catch (error) {
      console.error("Error deleting VPN:", error);
      throw error;
    }
  }

  async listVPNs() {
    return this.config.vpns;
  }

  async getVPNStatus(name) {
    if (!this.config.vpns[name]) {
      throw new Error(`VPN "${name}" not found`);
    }

    const vpn = this.config.vpns[name];
    AWS.config.update({ region: vpn.region });

    try {
      const vgwStatus = await ec2
        .describeVpnGateways({
          VpnGatewayIds: [vpn.vgwId],
        })
        .promise();

      return {
        name,
        ...vpn,
        currentStatus: vgwStatus.VpnGateways[0].State,
      };
    } catch (error) {
      console.error("Error getting VPN status:", error);
      throw error;
    }
  }
}

// CLI commands
program.name("cvpn").description("AWS VPN management CLI").version("1.0.0");

const vpnManager = new VPNManager();

program
  .command("create")
  .description("Create a new VPN")
  .argument("<name>", "Name of the VPN")
  .requiredOption("-r, --region <region>", "AWS region")
  .requiredOption("-c, --cidr <cidr>", "CIDR block for VPC")
  .action(async (name, options) => {
    await vpnManager.loadConfig();
    const vpn = await vpnManager.createVPN(name, options.region, options.cidr);
    console.log("VPN created successfully:", vpn);
  });

program
  .command("delete")
  .description("Delete a VPN")
  .argument("<name>", "Name of the VPN")
  .action(async (name) => {
    await vpnManager.loadConfig();
    await vpnManager.deleteVPN(name);
    console.log("VPN deleted successfully");
  });

program
  .command("list")
  .description("List all VPNs")
  .action(async () => {
    await vpnManager.loadConfig();
    const vpns = await vpnManager.listVPNs();
    console.log("VPNs:", vpns);
  });

program
  .command("status")
  .description("Get VPN status")
  .argument("<name>", "Name of the VPN")
  .action(async (name) => {
    await vpnManager.loadConfig();
    const status = await vpnManager.getVPNStatus(name);
    console.log("VPN Status:", status);
  });

program.parse();
