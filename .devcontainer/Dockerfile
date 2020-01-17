# Based on the example NodeJS DevContainer
FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:10

# The image referenced above includes a non-root user with sudo access. Add
# the "remoteUser" property to devcontainer.json to use it. On Linux, the container
# user's GID/UIDs will be updated to match your local UID/GID when using the image
# or dockerFile property. Update USER_UID/USER_GID below if you are using the
# dockerComposeFile property or want the image itself to start with different ID
# values. See https://aka.ms/vscode-remote/containers/non-root-user for details.
ARG USER_UID=1000
ARG USER_GID=$USER_UID
ARG USERNAME=node

# Uses parts from the CircleCI Node container to ensure alignment with test environment
# https://github.com/CircleCI-Public/circleci-dockerfiles/blob/master/node/images/10.18.0-stretch/Dockerfile
# https://github.com/CircleCI-Public/circleci-dockerfiles/blob/master/node/images/10.18.0-stretch/browsers/Dockerfile
# The parts have been cleaned up to introduce consistency and remove all the
# useless parts there were likely copied from StackOverflow answers.

# Make apt non-interactive
RUN echo 'APT::Get::Assume-Yes "true";' > /etc/apt/apt.conf.d/90circleci \
	&& echo 'DPkg::Options "--force-confnew";' >> /etc/apt/apt.conf.d/90circleci

ENV DEBIAN_FRONTEND=noninteractive

# Debian Jessie is EOL'd and original repos don't work.
# Switch to the archive mirror until we can get people to
# switch to Stretch.
RUN if grep -q Debian /etc/os-release && grep -q jessie /etc/os-release; then \
	rm /etc/apt/sources.list && \
	echo "deb http://archive.debian.org/debian/ jessie main" >> /etc/apt/sources.list && \
	echo "deb http://security.debian.org/debian-security jessie/updates main" >> /etc/apt/sources.list \
	; fi

# Make sure PATH includes ~/.local/bin
# https://bugs.debian.org/cgi-bin/bugreport.cgi?bug=839155
# This only works for root. The circleci user is done near the end of this Dockerfile
RUN echo 'PATH="$HOME/.local/bin:$PATH"' >> /etc/profile.d/user-local-path.sh

# man directory is missing in some base images
# https://bugs.debian.org/cgi-bin/bugreport.cgi?bug=863199
RUN apt-get update && \
	mkdir -p /usr/share/man/man1 && \
	apt-get install -y git mercurial xvfb apt locales sudo openssh-client ca-certificates tar gzip parallel net-tools netcat unzip zip bzip2 gnupg curl wget make

# Set timezone to UTC by default
RUN ln -sf /usr/share/zoneinfo/Etc/UTC /etc/localtime

# Use Unicode
RUN locale-gen C.UTF-8 || true
ENV LANG=C.UTF-8

# Install jq
RUN JQ_URL="https://circle-downloads.s3.amazonaws.com/circleci-images/cache/linux-amd64/jq-latest" && \
	curl --silent --show-error --location --fail --retry 3 --output /usr/bin/jq $JQ_URL && \
	chmod +x /usr/bin/jq && \
	jq --version

# Install Java 11 LTS / OpenJDK 11
RUN if grep -q Debian /etc/os-release && grep -q stretch /etc/os-release; then \
		echo 'deb http://deb.debian.org/debian stretch-backports main' | tee -a /etc/apt/sources.list.d/stretch-backports.list; \
	elif grep -q Ubuntu /etc/os-release && grep -q xenial /etc/os-release; then \
		apt-get update && \
		apt-get install -y software-properties-common && \
		add-apt-repository -y ppa:openjdk-r/ppa; \
	fi && \
	apt-get update && \
	apt-get install -y openjdk-11-jre openjdk-11-jre-headless openjdk-11-jdk openjdk-11-jdk-headless && \
	apt-get install -y bzip2 libgconf-2-4 # for extracting firefox and running chrome, respectively

# Install Firefox
RUN FIREFOX_URL="https://download.mozilla.org/?product=firefox-latest-ssl&os=linux64&lang=en-US" && \
	ACTUAL_URL=$(curl -Ls -o /dev/null -w %{url_effective} $FIREFOX_URL) && \
	curl --silent --show-error --location --fail --retry 3 --output /tmp/firefox.tar.bz2 $ACTUAL_URL && \
	tar -xvjf /tmp/firefox.tar.bz2 -C /opt && \
	ln -s /opt/firefox/firefox /usr/local/bin/firefox && \
	apt-get install -y libgtk3.0-cil-dev libasound2 libasound2 libdbus-glib-1-2 libdbus-1-3 && \
	rm -rf /tmp/firefox.* && \
	firefox --version

# Install geckodriver
RUN export GECKODRIVER_LATEST_RELEASE_URL=$(curl https://api.github.com/repos/mozilla/geckodriver/releases/latest | jq -r ".assets[] | select(.name | test(\"linux64\")) | .browser_download_url") && \
	curl --silent --show-error --location --fail --retry 3 --output /tmp/geckodriver_linux64.tar.gz "$GECKODRIVER_LATEST_RELEASE_URL" && \
	cd /tmp && \
	tar xf geckodriver_linux64.tar.gz && \
	rm -rf geckodriver_linux64.tar.gz && \
	mv geckodriver /usr/local/bin/geckodriver && \
	chmod +x /usr/local/bin/geckodriver && \
	geckodriver --version

# Install Chrome
RUN curl --silent --show-error --location --fail --retry 3 --output /tmp/google-chrome-stable_current_amd64.deb https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb && \
	(dpkg -i /tmp/google-chrome-stable_current_amd64.deb || apt-get -fy install)  && \
	rm -rf /tmp/google-chrome-stable_current_amd64.deb && \
	sed -i 's|HERE/chrome"|HERE/chrome" --disable-setuid-sandbox --no-sandbox|g' "/opt/google/chrome/google-chrome" && \
	google-chrome --version

RUN CHROME_VERSION="$(google-chrome --version)" && \
	export CHROMEDRIVER_RELEASE="$(echo $CHROME_VERSION | sed 's/^Google Chrome //')" && export CHROMEDRIVER_RELEASE=${CHROMEDRIVER_RELEASE%%.*} && \
	CHROMEDRIVER_VERSION=$(curl --silent --show-error --location --fail --retry 4 --retry-delay 5 http://chromedriver.storage.googleapis.com/LATEST_RELEASE_${CHROMEDRIVER_RELEASE}) && \
	curl --silent --show-error --location --fail --retry 4 --retry-delay 5 --output /tmp/chromedriver_linux64.zip "http://chromedriver.storage.googleapis.com/$CHROMEDRIVER_VERSION/chromedriver_linux64.zip" && \
	cd /tmp && \
	unzip chromedriver_linux64.zip && \
	rm -rf chromedriver_linux64.zip && \
	mv chromedriver /usr/local/bin/chromedriver && \
	chmod +x /usr/local/bin/chromedriver && \
	chromedriver --version

# Start xvfb automatically
ENV DISPLAY :99
RUN printf '#!/bin/sh\nXvfb :99 -screen 0 1280x1024x24 &\nexec "$@"\n' > /tmp/entrypoint && \
	chmod +x /tmp/entrypoint && \
	mv /tmp/entrypoint /docker-entrypoint.sh

# Make `gulp` available globally.
RUN npm install --global gulp-cli

# [Optional] Update UID/GID if needed
RUN if [ "$USER_GID" != "1000" ] || [ "$USER_UID" != "1000" ]; then \
		groupmod --gid $USER_GID $USERNAME && \
		usermod --uid $USER_UID --gid $USER_GID $USERNAME && \
		chown -R $USER_UID:$USER_GID /home/$USERNAME; \
	fi && \
	#
	# Avoid having to use "sudo" with "npm -g" when running as non-root user
	SNIPPET='if [ "$(stat -c %U /usr/local/lib/node_modules)" != "$(id -u)" ]; then \
		sudo chown -R $(id -u):root /usr/local/lib/node_modules && \
		sudo chown -R $(id -u):root /usr/local/bin; \
		fi' && \
	echo $SNIPPET >> /home/$USERNAME/.bashrc && \
	echo $SNIPPET >> /home/$USERNAME/.zshrc && \
	chown $USERNAME /home/$USERNAME/.bashrc /home/$USERNAME/.zshrc
