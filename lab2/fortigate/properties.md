## Properties available when deploying instances using templates in this directory

| Property Name | Type | Description | Default value | Single VM | HA | HA ELB |
----------------|------|-------|---------------|-----------|----|--------|
`prefix` | *string* | Prefix to prepend to all deployed resources. | [deployment name] | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark:
`name` | *string* | Name of instance. For HA deployments hard-coded to fgt1, fgt2 | fgt | :heavy_check_mark: | :x: | :x:
`region` | *string* | Region to deploy resources to | | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark:
`zone` | *gce-zone* | Zone to deploy Fortigate to | | :heavy_check_mark: | :x: | :x: |
`zone1` | *gce-zone* | Zone for fgt1 (Master Fortigate instance) | | :x: | :heavy_check_mark: | :heavy_check_mark:
`zone2` | *gce-zone* | Zone for fgt2 (Slave Fortigate instance) | | :x: | :heavy_check_mark: | :heavy_check_mark:
`instanceType` | *string* | Type of GCE instance to deploy | "e2-highcpu-4" | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark:
`license` | *object* | Description of Fortigate licensing. See [below](#license) for structure details | type: "payg" | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark:
`version` | *enum* | Firmware version to deploy. Currently supported 6.2.3 and 6.4.0 | "6.2.3" | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark:
`networks` | *object* | Networks to connect to. See [below](#networks) for object structure | | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark:
`serviceAccount` | *string* | GCP service account to use for SDN connector | "default" | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark:
`serialPortEnable` | *boolean* | Enable/disable serial port console | true | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark:
`publicIPs` | *array* | List of names of public IPs to be created | `- name: ext-ip` | :x: | :x: | :heavy_check_mark:

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
lic1: forti1.lic
lic2: forti2.lic
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
- **cidr** - CIDR address of the subnet

#### Example of a complete object:
```yaml
networks:
  internal:
    vpc: projects/my-project-123/global/networks/int
    subnet: projects/my-project-123/regions/europe-west1/subnetworks/int-snet
    cidr: 10.0.1.0/24
  external:
    vpc: projects/my-project-123/global/networks/ext
    subnet: projects/my-project-123/regions/europe-west1/subnetworks/ext-snet
    cidr: 10.0.2.0/24
  hasync:
    vpc: projects/my-project-123/global/networks/hasync
    subnet: projects/my-project-123/regions/europe-west1/subnetworks/hasync-snet
    cidr: 10.0.3.0/24
  mgmt:
    vpc: projects/my-project-123/global/networks/mgmt
    subnet: projects/my-project-123/regions/europe-west1/subnetworks/mgmtsnet
    cidr: 10.0.4.0/24
```
