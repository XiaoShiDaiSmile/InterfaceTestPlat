#!/usr/bin/env python
# @FileName : getApiManager
# @Time : 2023/3/21 14:55
# @Anthor : Administrator
# @SofeWare : InterfaceTestPlat
from com.common.model import db,api_manager

class OperateApiManager:
    def get_all(self):
        return api_manager.query.all()


OperateApiManager = OperateApiManager()
