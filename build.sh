#!/bin/bash
source .venv/bin/activate \
    && cd react-app \
    && pnpm run build \
    && cd .. \
    && sudo docker build -t boopmynose . \
    && sudo docker save -o boopmynose.tar boopmynose \
    && sudo chown $USER:$USER boopmynose.tar
