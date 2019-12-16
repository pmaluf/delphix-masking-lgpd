# LGPD

## Masking

### masking_setup.sh
```sh
# masking_setup.sh
# Created: Paulo Victor Maluf - 09/2019
#
# Parameters:
#
#   masking_setup.sh --help
#
#    Parameter             Short Description                                                        Default
#    --------------------- ----- ------------------------------------------------------------------ --------------
#    --profile-name           -p Profile name
#    --expressions-file       -e CSV file like ExpressionName;DomainName;level;Regex                expressions.cfg
#    --domains-file           -d CSV file like Domain Name;Classification;Algorithm                 domains.cfg
#    --masking-engine         -m Masking Engine Address
#    --help                   -h help
#
#   Ex.: masking_setup.sh --profile-name LGPD -e ./expressions.csv -d domains.cfg -m 172.168.8.128
```
