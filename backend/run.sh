#!/bin/bash
set -euxo pipefail

export GOOGLE_APPLICATION_CREDENTIALS="[PATH]"

asdf exec npm ci