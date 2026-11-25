import os

# Django validates the socket peer against explicit proxy CIDRs. Prevent Gunicorn
# from independently accepting protocol headers from its default loopback peers.
forwarded_allow_ips = ""
secure_scheme_headers = {}
# Keep errors visible in container logs; avoid access logs containing URL metadata.
errorlog = "-"
accesslog = None
graceful_timeout = 30
timeout = 30

# Resolve PORT inside the running container. Dokku may expand shell variables in
# an image/Procfile command before injecting that container's environment.
bind = f"0.0.0.0:{os.environ.get('PORT') or '8000'}"
