#!/usr/bin/env python
# @FileName : views
# @Time : 2023/3/21 11:02
# @Anthor : Administrator
# @SofeWare : InterfaceTestPlat
from flask import Blueprint,render_template

views = Blueprint("views",__name__)

@views.route("/")
def index():
    return render_template("admin/index.html")
