#!/bin/bash
set -euxo pipefail

export GOOGLE_APPLICATION_CREDENTIALS="assets/google-85a16f53fe84.json"

asdf exec npm ci
asdf exec node