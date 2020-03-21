#!/bin/bash
set -euxo pipefail

service_name='corona-assistant'

gcloud iam service-accounts create "$service_name"