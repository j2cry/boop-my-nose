FROM python:3.12-slim

ARG CONTAINER_USER=boopmynose
ARG APPDIR=/opt/boopmynose

RUN pip install flask flask-socketio eventlet pillow onnx onnxruntime \
    && mkdir $APPDIR \
    && adduser $CONTAINER_USER \
    && chown -R $CONTAINER_USER:$CONTAINER_USER "$APPDIR"

COPY ./api/ /opt/boopmynose/
COPY ./react-app/dist/ /opt/boopmynose/

USER $CONTAINER_USER
WORKDIR "$APPDIR"

ENTRYPOINT [ "python", "app.py" ]
