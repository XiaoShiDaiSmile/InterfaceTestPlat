from flask import Flask
from flask_assets import Environment,Bundle
from livereload import Server

from com.route.views import views

app = Flask(__name__)

class Main:
    def __init__(self):
        self.app = app
        self.app.config['DEBUG'] = True
        self.app.config['ASSET_DEBUG'] = True
        self.setAssets()

    def setAssets(self):
        assets = Environment(self.app)
        assets.url = self.app.static_url_path
        common_css = Bundle(
            'css/index.scss',
            filters="pyscss",
            output="all.css"
        )
        common_js = Bundle(
            'js/index.js',
            filters="jsmin",
            output="all.js"
        )
        assets.register('all_css',common_css)
        assets.register('all_js',common_js)

    def get_app(self):
        return self.app


main = Main()
main.get_app().register_blueprint(views)

if __name__ == "__main__":
    # app.run()
    server = Server(app.wsgi_app)
    server.serve(port=5000)