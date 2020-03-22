
## Installation

1. Create a Python virtual environment

    ```
    cd telegrambot
    python3 -m venv venv-corona-assistent
    source venv-corona-assistent/bin/activate
    pip install -r requirements.txt
    pip install -e .
    ```

2. Create a `.env` file for the environment variables, with the following
    contents:

    ```
    TELEGRAM_BOT_TOKEN=<token here>
    DATABASE_URL=sqlite:////absolute/path/to/bot.db
    FLASK_APP=corona_assistent_bot.web:create_app()
    ```
   
## Running

1. Start the telegram bot

    ```
   python -m corona_assistent_bot telegram-bot
    ```
   
2. Start the API server

    ```
    flask run
    ```
   
3. Send a message

    ```
    curl -d '{"text": "Hallo!"}' -H 'Content-Type: application/json' http://localhost:5000/message
    ```
