# Build from the tested candidate image with a context containing only the
# collector's reviewed assets/ output. Never copy an entire previous public tree.
ARG RELEASE_IMAGE
FROM ${RELEASE_IMAGE}
COPY assets/ /srv/app/frontend_dist/assets/
