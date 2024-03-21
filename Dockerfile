FROM alpine AS base
ENV TZ=America/New_York
ENV ARCHIVE_DAY_PATTERN=%Y%m%d
ENV ARCHIVE_TIME_PATTERN=%H%M%S
ENV TCPDUMP_IF=eth0
ENV ROTATE_SECS=3600
ENV TRACE_PATH=/traces
ENV TCPDUMP_FILES=trace_${ARCHIVE_DAY_PATTERN}_${ARCHIVE_TIME_PATTERN}.pcap
ENV TCPDUMP_FILTER="not (ip[6:2] & 0x1fff > 0) and not port 22"

FROM base AS tracer
RUN apk --no-cache update && apk --no-cache upgrade && apk --no-cache --update add tcpdump tzdata
COPY entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]

FROM base AS archiver
ENV KEEP=12
ENV ARCHIVE_PATH=${TRACE_PATH}/archives

FROM base AS gui



