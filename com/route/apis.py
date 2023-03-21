#!/usr/bin/env python
# @FileName : apis
# @Time : 2023/3/21 14:52
# @Anthor : Administrator
# @SofeWare : InterfaceTestPlat
from flask import Blueprint
from flask_restful import Api,Resource,reqparse

from com.service.getApiManager import OperateApiManager

apis = Blueprint("apis",__name__)
api = Api(apis)


class getApiManager(Resource):
    def __init__(self):
        self.parser = reqparse.RequestParser()
        self.args = self.parser.parse_args()

    def get(self):
        result = OperateApiManager.get_all()
        return {"code":200,"msg":"success","data":[item.to_json() for item in result]}
        pass

    def post(self):
        print("post")
        pass


api.add_resource(getApiManager,'/getApiManager')
