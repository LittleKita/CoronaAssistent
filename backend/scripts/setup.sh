#!/bin/bash
set -euxo pipefail


install_asdf() {
  git clone https://github.com/asdf-vm/asdf.git ~/.asdf --branch v0.7.7

  echo -e '\n. $HOME/.asdf/asdf.sh' >> ~/.bashrc
  echo -e '\n. $HOME/.asdf/completions/asdf.bash' >> ~/.bashrc

  sudo apt install \
    automake autoconf libreadline-dev \
    libncurses-dev libssl-dev libyaml-dev \
    libxslt-dev libffi-dev libtool unixodbc-dev \
    unzip curl

  apt-get install dirmngr
  apt-get install gpg

  asdf plugin-add nodejs https://github.com/asdf-vm/asdf-nodejs.git
  bash ~/.asdf/plugins/nodejs/bin/import-release-team-keyring
}

install_googleskd() {
  output_file='google-cloud-sdk.tar.gz'
  curl https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-sdk-280.0.0-linux-x86_64.tar.gz --output "$output_file"
  tar -xzf "$output_file"
  rm "$output_file"
  ./google-cloud-sdk/install.sh --usage-reporting=false -q

  ./google-cloud-sdk/bin/gcloud init
}

install_asdf
install_google