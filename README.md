# Boop my nose!

Implemented using CPython 3.12
- `requirements-ai.txt` - dependencies list for modeling (`model.ipynb`)
- `requirements.txt` - dependencies list for backend (`api/app.py`)

## Deploy
1. Download & unpack or clone this repo

2. Download and unpack [AFPHQ](https://github.com/j2cry/AFPHQ "An extension for AFHQ dataset") dataset

3. Setup your `.env`:
    ```sh
    # debug flag
    BOOPMYNOSE_DEBUG=true
    # image folder for backend app
    BOOPMYNOSE_IMAGE_FOLDER=...
    # prediction threshold
    BOOPMYNOSE_THRESHOLD=0.5
    # socketio allowed cors
    BOOPMYNOSE_CORS=*
    # dataset folder for modeling (not required in prod)
    BOOPMYNOSE_DATASET=...
    ```

4. Create virtual environment for modeling
    ```sh
    python -m venv .venvai
    source .venvai/bin/activate
    pip install -r requirements-ai.txt
    ```

5. Run all cells in `model.ipynb` to fit model. It will be exported to `api/boopmynose.onnx.model`

6. Install Node.js (`npm` or `pnpm`). If you don't want to install it globally, search for [some](https://pypi.org/project/nodeenv/) python package that may do the trick

7. Run `app.py` using your IDE command

8. Run react app
    ```sh
    cd react-app
    npm dev run
    ```


## Links
* [SVG collection](https://www.svgrepo.com/collection/doodle-library-hand-drawn-vectors/6)
