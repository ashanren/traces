FROM alpine:latest AS base
ARG WORK /opt/app
WORKDIR $WORK
RUN apk --no-cache update && apk --no-cache upgrade && apk --no-cache --update add curl git nodejs yarn bash

FROM base AS non_root
ARG ID=1000
ARG GID=1000
ARG USER=dev
RUN apk add --update sudo
RUN addgroup --gid $GID $USER \
  && adduser --uid $ID --disabled-password $USER --ingroup $USER
RUN echo "$USER ALL=(ALL) NOPASSWD: ALL" > /etc/sudoers.d/$USER \
  && chmod 0440 /etc/sudoers.d/$USER
RUN sudo chown -R $USER:$USER /opt
USER $USER

FROM non_root AS dev
CMD ["/bin/bash"]

