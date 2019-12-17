#!/bin/bash
#
# masking_setup.sh
# Created: Paulo Victor Maluf - 09/2019
#
# Parameters:
#
#   masking_setup.sh --help
#
#    Parameter             Short Description                                                        Default
#    --------------------- ----- ------------------------------------------------------------------ ---------------
#    --profile-name           -p Profile name
#    --expressions-file       -e Delimiter file like: ExpressionName;DomainName;level;Regex         expressions.cfg               
#    --domains-file           -d Delimiter file like: Domain Name;Classification;Algorithm          domains.cfg 
#    --connection-file        -c Delimiter file like: connectorName;databaseType;environmentId;     connections.cfg
#    --ruleset-file           -r Delimiter file like: rulesetName;connectorName                     ruleset.cfg
#    --masking-engine         -m Masking Engine Address
#    --help                   -h help
#
#   Ex.: masking_setup.sh --profile-name LGPD -e ./expressions.csv -d ./domains.cfg -c ./connections.cfg -m 172.168.8.128
#
# Changelog:
#
# Date       Author               Description
# ---------- ------------------- ----------------------------------------------------
#====================================================================================

################################
# VARIAVEIS GLOBAIS            #
################################
USERNAME="Admin"
PASSWORD="Admin-12"
LAST=".last"

################################
# FUNCOES                      #
################################
help()
{
  head -21 $0 | tail -19
  exit
}

log (){
  echo -ne "[`date '+%d%m%Y %T'`] $1" | tee -a ${LAST}
}

# Check if $1 is equal to 0. If so print out message specified in $2 and exit.
check_empty() {
    if [ $1 -eq 0 ]; then
        echo $2
        exit 1
    fi
}

# Check if $1 is an object and if it has an 'errorMessage' specified. If so, print the object and exit.
check_error() {
    # jq returns a literal null so we have to check againt that...
    if [ "$(echo "$1" | jq -r 'if type=="object" then .errorMessage else "null" end')" != 'null' ]; then
        echo $1
        exit 1
    fi
}

# Login and set the correct $AUTH_HEADER.
login() {
echo "* logging in..."
LOGIN_RESPONSE=$(curl -s -X POST -H 'Content-Type: application/json' -H 'Accept: application/json' --data @- $MASKING_ENGINE/login <<EOF
{
    "username": "$USERNAME",
    "password": "$PASSWORD"
}
EOF
)
    check_error "$LOGIN_RESPONSE"
    TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.Authorization')
    AUTH_HEADER="Authorization: $TOKEN"
}

add_expression(){
DOMAIN=${1}
EXPRESSNAME=${2}
REGEXP=${3}
DATALEVEL=${4}

curl -s -X POST -H ''"${AUTH_HEADER}"'' -H 'Content-Type: application/json' -H 'Accept: application/json' --data @- ${MASKING_ENGINE}/profile-expressions <<EOF
{
  "domainName": "${DOMAIN}",
  "expressionName": "${EXPRESSNAME}",
  "regularExpression": "${REGEXP}",
  "dataLevelProfiling": ${DATALEVEL}
}
EOF
}

add_domain(){
NEW_DOMAIN=${1}
CLASSIFICATION=${2}
ALGORITHM=${3}

curl -s -X POST -H ''"${AUTH_HEADER}"'' -H 'Content-Type: application/json' -H 'Accept: application/json' --data @- ${MASKING_ENGINE}/domains <<EOF
{
  "domainName": "${NEW_DOMAIN}",
  "classification": "${CLASSIFICATION}",
  "defaultAlgorithmCode": "${ALGORITHM}"
}
EOF
}

add_profileset(){
PROFILENAME=${1}
EXPRESSID=${2}

curl -s -X POST -H ''"${AUTH_HEADER}"'' -H 'Content-Type: application/json' -H 'Accept: application/json' --data @- ${MASKING_ENGINE}/profile-sets <<EOF
{
  "profileSetName": "${PROFILENAME}",
  "profileExpressionIds": [ ${EXPRESSID} ]
}
EOF
}

create_connection(){
CONNECTORNAME=${1}
DATABASETYPE=${2}
ENVIRONMENTID=${3}
HOST=${4}
PASSWORD=${5}
PORT=${6}
SCHEMANAME=${7}
SID=${8}
USERNAME=${9}

curl -s -X POST -H ''"${AUTH_HEADER}"'' -H 'Content-Type: application/json' -H 'Accept: application/json' --data @- ${MASKING_ENGINE}/database-connectors <<EOF
{
  "connectorName": "${CONNECTORNAME}",
  "databaseType": "${DATABASETYPE}",
  "environmentId": ${ENVIRONMENTID},
  "host": "${HOST}",
  "password": "${PASSWORD}",
  "port": ${PORT},
  "schemaName": "${SCHEMANAME}",
  "sid": "${SID}",
  "username": "${USERNAME}"
}
EOF
}

get_connectorid(){
CONNECTORNAME=${1}

CONNECTORLIST=$(curl -s -X GET -H ''"${AUTH_HEADER}"'' -H 'Content-Type: application/json' -H 'Accept: application/json' ${MASKING_ENGINE}/database-connectors)
CONNECTORID=$(echo ${CONNECTORLIST} | jq -r ".responseList[] | select(.connectorName == "${CONNECTORNAME}") | .databaseConnectorId")

echo ${CONNECTORID}
}

create_ruleset(){
RULESETNAME=${1}
DATABASECONNECTORID=${2}

RET=$(curl -s -X POST -H ''"${AUTH_HEADER}"'' -H 'Content-Type: application/json' -H 'Accept: application/json' --data @- ${MASKING_ENGINE}/database-rulesets <<EOF
{
  "rulesetName": "${RULESETNAME}",
  "databaseConnectorId": ${DATABASECONNECTORID}
}
EOF
)

RESULTSETID=$(echo ${RET} | jq -r '.databaseRulesetId')
echo ${RESULTSETID}

}

ruleset_bulkupdate(){
RULESETID=${1}

curl -s -X PUT -H ''"${AUTH_HEADER}"'' -H 'Content-Type: application/json' -H 'Accept: application/json' --data @- ${MASKING_ENGINE}/database-rulesets/${RULESETID}/bulk-table-update <<EOF
{
  "tableMetadata": [
    {
      "tableName": "*",
      "rulesetId": ${RULESETID}
    }
  ]
}
EOF

}

################################
# ARGPARSER                    #
################################
# Verifica se foi passado algum parametro
[ "$1" ] || { help ; exit 1 ; }

# Verifica se o jq esta instalado
[ -x "$(which jq)" ] || { echo "jq not found. Please install 'jq' package and try again." ; exit 1 ; }

# Tratamento dos Parametros
for arg
do
    delim=""
    case "$arg" in
    #translate --gnu-long-options to -g (short options)
      --profile-name)         args="${args}-p ";;
      --expressions-file)     args="${args}-e ";;
      --domains-file)         args="${args}-d ";;
      --connection-file)      args="${args}-c ";;
      --ruleset-file)         args="${args}-r ";;
      --masking-engine)       args="${args}-m ";;
      --help)                 args="${args}-h ";;
      #pass through anything else
      *) [[ "${arg:0:1}" == "-" ]] || delim="\""
         args="${args}${delim}${arg}${delim} ";;
    esac
done

eval set -- $args

while getopts ":hp:e:d:m:c:r:" PARAMETRO
do
    case $PARAMETRO in
        h) help;;
        p) PROFILENAME=${OPTARG[@]};;
        e) EXPRESSFILE=${OPTARG[@]};;
        d) DOMAINSFILE=${OPTARG[@]};;
        c) CONNECTIONFILE=${OPTARG[@]};;
        r) RULESETFILE=${OPTARG[@]};;
        m) MASKING_ENGINE=${OPTARG[@]};;
        :) echo "Option -$OPTARG requires an argument."; exit 1;;
        *) echo $OPTARG is an unrecognized option ; echo $USAGE; exit 1;;
    esac
done

################################
# MAIN                         #
################################
if [ -e ${EXPRESSFILE} ] && [ -e ${DOMAINSFILE} ] && [ ${MASKING_ENGINE} ]
  then
    # Set masking engine variable from user input
    MASKING_ENGINE="http://${MASKING_ENGINE}/masking/api"
    
    # Login on Masking Engine
    login

    # Create connection environment
    if [ -e ${CONNECTIONFILE} ]
      then
        log "** creating connection environment ${CONNECTORNAME}...\n"
        while IFS=\; read -r CONNECTORNAME DATABASETYPE ENVIRONMENTID HOST PASSWORD PORT SCHEMANAME SID USERNAME
        do
          if [[ ! ${CONNECTORNAME} =~ "#" ]]
            then
              log "* ${CONNECTORNAME}\n"
              ret=$(create_connection ${CONNECTORNAME} ${DATABASETYPE} ${ENVIRONMENTID} ${HOST} ${PASSWORD} ${PORT} ${SCHEMANAME} ${SID} ${USERNAME})
          fi
        done < ${CONNECTIONFILE}
    fi

    # Create Domains 
    log "** creating domain ${NEW_DOMAIN}...\n"
    while IFS=\; read -r NEW_DOMAIN CLASSIFICATION ALGORITHM
    do
      if [[ ! ${NEW_DOMAIN} =~ "#" ]]
        then
          log "* ${NEW_DOMAIN}\n"
          ret=$(add_domain ${NEW_DOMAIN} ${CLASSIFICATION} ${ALGORITHM})
      fi
    done < ${DOMAINSFILE}

    # Create Expressions 
    log "** creating expression ${EXPRESSNAME}...\n"
    while IFS=\; read -r EXPRESSNAME DOMAIN DATALEVEL REGEXP
    do
      if [[ ! ${EXPRESSNAME} =~ "#" ]]
        then
          log "* ${EXPRESSNAME}\n" 0
          ret=$(add_expression ${DOMAIN} ${EXPRESSNAME} ${REGEXP} ${DATALEVEL} | tee -a $$.tmp)
      fi
    done < ${EXPRESSFILE}
  
    # Get Created Expression Ids
    # 7 - Creditcard
    # 8 - Creditcard
    # 11 - Email
    # 22 - Creditcard Data
    # 23 - Email Data
    # 49 - Ip Address Data
    # 50 - Ip Address
    EXPRESSID=$(egrep -o '"profileExpressionId":[0-9]+' $$.tmp | cut -d: -f2 | xargs | sed 's/ /,/g')
    EXPRESSID="7,8,11,22,23,49,50,${EXPRESSID}"
    
    # Add ProfileSet
    log "** Adding expressions ids ${EXPRESSID} to LGPD ...\n"
    ret=$(add_profileset "${PROFILENAME}" "${EXPRESSID}")

    # remove tmpfile
    rm -f $$.tmp
    
    # Create RuleSet 
    if [ -e ${RULESETFILE} ]
      then
        log "* creating ruleset ${RULESETNAME}...\n"
        while IFS=\; read -r RULESETNAME CONNECTORNAME
        do
          if [[ ! ${RULESETNAME} =~ "#" ]]
            then
              log "** Getting connector id for ${CONNECTORNAME}...\n"
              CONNECTORID=$(get_connectorid ${CONNECTORNAME})

              log "** Creating ruleset ${RULESETNAME}...\n"
              RULESETID=$(create_ruleset ${RULESETNAME} ${CONNECTORID})

              log "** Executing bulk table update for ${RULESETNAME}"
              ret=$(ruleset_bulkupdate ${RULESETID})
          fi
        done < ${RULESETFILE}
    fi
fi
