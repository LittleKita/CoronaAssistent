import click
from dotenv import load_dotenv

from corona_assistent_bot.bot import run_bot


@click.group()
def cli():
    """CLI for the CoronaAssistent Bot"""


@cli.command()
def telegram_bot():
    load_dotenv()
    run_bot()


if __name__ == '__main__':
    cli()
