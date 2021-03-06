# Fortigate deployment models
This directory contains several ways to deploy Fortigate appliance(s).

- [Single VM](singlevm.md)
- [Active-Passive HA Cluster (single Public IP)](ha-ap.md)
- [Active-Passive with Load Balancer (multiple Public IPs)](ha-ap-elb.md)

## How to Deploy
All templates are written for [GCP Deployment Manager](https://cloud.google.com/deployment-manager). DM templates can be deployed using [`gcloud`](https://cloud.google.com/sdk) command-line tool available for local downloads and in your [cloud shell](https://cloud.google.com/shell/docs/using-cloud-shell).

Templates (\*.jinja) can be referenced directly (and provide all parameters in the command line), e.g.:
```
gcloud deployment-manager deployments create --template singlevm.jinja --properties=...
```
but it's much more practical (and recommended) to create a YAML [configuration file](https://cloud.google.com/deployment-manager/docs/configuration/create-basic-configuration) and use it instead:
```
gcloud deployment-manager deployments create --config=config.yaml
```

As `gcloud` can fetch for you templates from remote servers - you do not need to clone whole repository to your disk. Simply create your *config* file locally and import templates from GitHub, like this:
```yaml
imports:
- path: https://raw.githubusercontent.com/40net-cloud/fortinet-gcp-solutions/master/gcp-dm/fortigate/ha-ap.jinja
  name: ha-ap.jinja
```


## Properties Available
All templates in this directory share common properties (at least most of them). Properties are configurable values you can easily modify either using `--properties` if deploying template file directly, or by adding them to the configuration file under `properties` section.

**NOTE:** In most cases you should NOT need to modify the template files (.jinja) or schema files (.jinja.schema). Check twice if your modification is not possible via configuration properties before changing jinjas.


| Property Name | Type | Description | Default value | Single VM | HA | HA ELB |
----------------|------|-------|---------------|-----------|----|--------|
`prefix` | *string* | Prefix to prepend to all deployed resources. | [deployment name] | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark:
`name` | *string* | Name of instance. For HA deployments hard-coded to fgt1, fgt2 | fgt | :heavy_check_mark: | :x: | :x:
`region` | *string* | Region to deploy resources to | | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark:
`zone` | *gce-zone* | Zone to deploy Fortigate to | | :heavy_check_mark: | :x: | :x: |
`zones` | *gce-zone[]* | Zones for Master and Slave instances | | :x: | :heavy_check_mark: | :heavy_check_mark:
`instanceType` | *string* | Type of GCE instance to deploy | "e2-highcpu-4" | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark:
`license` | *object* | Description of Fortigate licensing. See [below](#license) for structure details | type: "payg" | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark:
`version` | *enum* | Firmware version to deploy. Currently supported 6.2.3 and 6.4.0 | "6.2.3" | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark:
`networks` | *object* | Networks to connect to. See [below](#networks) for object structure | | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark:
`serviceAccount` | *string* | GCP service account to use for SDN connector | "default" | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark:
`serialPortEnable` | *boolean* | Enable/disable serial port console | true | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark:
`publicIPs` | *array* | List of names of public IPs to be created | `- name: ext-ip` | :x: | :x: | :heavy_check_mark:
`fwConfig` | *string* | Custom Fortigate configuration script to be executed during provisioning | | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark:
`externalIP` | *object* | Object with .address and .networkTier properties with preexisting public IP to be attached to new Fortigate instance | | :heavy_check_mark: | :x: | :x:
`attachPublicIP` | *boolean* | Set to false for deployments without directly attached public IP | true | :heavy_check_mark: | :x: | :x:
`routes` | *array* | Array of objects indicating routes to be redirected via FGT. Supported properties: destRange, name, priority. | 0.0.0.0/0 | :heavy_check_mark: | :x: | :x:

### license
`license` property allows you to deploy either PAYG or BYOL Fortigate instances and provision licenses for BYOL during deployment.

#### For PAYG deployments (default)
```yaml
type: payg
```

#### For BYOL deployments
If you plan to use BYOL license provisioning, follow these steps:
1. save your license file(s) in location you can access during deployment
2. import license file(s) in your configuration file, e.g.:
        imports:
         - path: ../mylicenses/FGVM04TM20001661.lic
           name: forti1.lic
3. refer to imported license files in `license` property as shown below:

Single VM:
```yaml
type: byol
lic: forti1.lic
```

HA deployments:
```yaml
type: byol
lics:
- forti1.lic
- forti2.lic
```

### networks
`networks` property defines VPC Networks your Fortigate is connected to. For Single VM it means 2 VPCs (internal and external), for HA deployments 2 additional are needed (HA heartbeat and management). All 4 network types have predefined names in the `networks` object:
* internal
* external
* hasync
* mgmt

Each network in `networks` object has following properties:
- **vpc** - url of VPC Network
- **subnet** - url of VPC Subnet
- **ipCidrRange** - [optional] CIDR address of the subnet
- **networkIP** - [optional] instance IP address with mask (e.g. 192.168.0.2/24).

NOTE: If **networkIP** is not set, first IP from ipCidrRange will be assigned as static IP. If **ipCidrRange** is not set, instance will use DHCP assignment. Long netmask (255.255.255.0) is NOT supported.

#### Example of a complete object:
```yaml
networks:
  internal:
    vpc: projects/my-project-123/global/networks/int
    subnet: projects/my-project-123/regions/europe-west1/subnetworks/int-snet
    ipCidrRange: 10.0.1.0/24
  external:
    vpc: projects/my-project-123/global/networks/ext
    subnet: projects/my-project-123/regions/europe-west1/subnetworks/ext-snet
    ipCidrRange: 10.0.2.0/24
  hasync:
    vpc: projects/my-project-123/global/networks/hasync
    subnet: projects/my-project-123/regions/europe-west1/subnetworks/hasync-snet
    ipCidrRange: 10.0.3.0/24
  mgmt:
    vpc: projects/my-project-123/global/networks/mgmt
    subnet: projects/my-project-123/regions/europe-west1/subnetworks/mgmtsnet
    ipCidrRange: 10.0.4.0/24
```

## Examples
Check examples directory for sample config files.
