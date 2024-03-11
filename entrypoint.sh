#!/bin/sh
mkdir -p $TRACE_PATH
tcpdump -i $TCPDUMP_IF -Z root -G $ROTATE_SECS -w "$TRACE_PATH/$TCPDUMP_FILES" -U "$TCPDUMP_FILTER"

