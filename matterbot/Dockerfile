# Select the base image
FROM nadavtasher/template:2021.03.28

# Install dependancies
RUN npm install mattermost-client@6.4.1

# Environment
ENV MATTERMOST_TLS_VERIFY=false
ENV MATTERMOST_USE_TLS=true

# Copy sources
COPY sources/backend backend
COPY sources/frontend frontend