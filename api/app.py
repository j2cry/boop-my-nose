import base64
import hashlib
import os
import pathlib
import random
import typing

import numpy as np
import onnxruntime
from flask import Flask
from flask_socketio import SocketIO
from PIL import Image


# ==================== descriptions ====================
class ImageResponse(typing.TypedDict):
    id: str
    url: str
    width: int
    height: int

class ClickedImage(typing.TypedDict):
    id: str
    x: int
    y: int


# ==================== init globals ====================
DEBUG = os.getenv('BOOPMYNOSE_DEBUG', '').lower() in {'true', '1', 'on'}
model = onnxruntime.InferenceSession(
    f"{'api/' if DEBUG else ''}boopmynose.onnx.model",
    providers=["CPUExecutionProvider"]
)
THRESHOLD: float = float(os.getenv('BOOPMYNOSE_THRESHOLD', 0.5))
IMAGES = {
    hashlib.md5(path.absolute().as_posix().encode()).hexdigest(): path
    for path in pathlib.Path(os.getenv('BOOPMYNOSE_IMAGE_FOLDER', '/var/boopmynose')).glob('*')
}
CORS = _cors.split(',') if (_cors := os.getenv('BOOPMYNOSE_CORS', '*')) != '*' else _cors


# ==================== init Flask & socket ====================
app = Flask('boop-my-nose-app', static_folder='assets')
app.secret_key = os.urandom(40).hex()
socket = SocketIO(app, cors_allowed_origins=CORS, allow_upgrades=False, async_mode='eventlet')


# ==================== entrypoints ====================
@app.route('/')
def index():
    """ Load landing """
    try:
        with open('index.html', encoding='utf-8') as f:
            page = f.read()
    except:
        return 'Something is wrong: cannot find index.html'
    return page


@socket.on('new-image')
def new_image():
    """ Prepare new image """
    if not IMAGES:
        return {'error': 'No images found'}
    key = random.choice(tuple(IMAGES.keys()))
    # load image
    with open(IMAGES[key], 'rb') as f:
        data = f.read()
    return {
        'id': key,
        'image': base64.b64encode(data),
    }


@socket.on('click')
def click(data: ClickedImage):
    # load & prepare image
    image = np.array(
        [Image.open(IMAGES[data['id']])],
        dtype=np.float32
    ).transpose(0, 3, 1, 2)
    # predict mask
    mask = model.run(None, {model.get_inputs()[0].name: image})[0][0] > THRESHOLD
    # detect collision
    if mask[0, data['y'], data['x']]:
        return 1
    elif mask[1, data['y'], data['x']]:
        return 2
    else:
        return 0


if __name__ == '__main__':
    socket.run(app, '0.0.0.0', port=5252, debug=DEBUG)
