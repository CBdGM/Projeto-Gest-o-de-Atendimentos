import click
from flask.cli import with_appcontext
from app.services.renovacao_sessoes import renovar_sessoes_repetidas

@click.command("renovar-sessoes")
@with_appcontext
def renovar_sessoes_command():
    renovar_sessoes_repetidas()
    click.echo("Sessões futuras geradas com sucesso.")