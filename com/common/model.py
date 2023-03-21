#!/usr/bin/env python
# @FileName : model
# @Time : 2023/3/21 13:39
# @Anthor : Administrator
# @SofeWare : InterfaceTestPlat
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Integer,Column,String,Text,DateTime

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = "mysql+pymysql://root:2069079840@localhost:3306/manage?charset=utf8"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_COMMIT_TEARDOWN'] = True

db = SQLAlchemy(app)


class api_manager(db.Model):
    __tablename__  = 'api_manager'
    id = Column(Integer,primary_key=True,autoincrement=True,comment="服务编号")
    api_name = Column(String(200),nullable=False,comment="服务名称")
    model = Column(String(200),nullable=True,comment="项目名称")
    type = Column(String(200),nullable=True,comment="请求类型")
    path = Column(String(200),nullable=True,comment="服务路径")
    headers = Column(String(200),nullable=True,comment="请求头信息")
    token = Column(String(200),nullable=True,comment="token")
    status = Column(Integer,nullable=True,comment="服务状态")
    remarks = Column(Text,nullable=True,comment="备注")

    def to_json(self):
        return{
            "id":self.id,
            "api_name":self.api_name,
            "model":self.model,
            "type":self.type,
            "path":self.path,
            "headers":self.headers,
            "token":self.token,
            "status":self.status,
            "remarks":self.remarks
        }

    def add_data(self):
        apidata = (
            ['登录','交易中心项目','get','/login','{"assets":"assets"}','{"token":"1234567890"}',1,'前端服务备注'],
            ['专家列表', '交易中心项目', 'post', '/zhuabgjia', '{"assets":"assets1"}', '{"token":"zhuanjia "}', 0, '专家备注'],
            ['登录', '智慧城管项目', 'get', '/login', '{"assets":"assets2"}', '{"token":"login"}', 1, '智慧城管备注']
        )
        for item in apidata:
            api_name = item[0],
            model = item[1],
            type = item[2],
            path = item[3],
            headers = item[4],
            token = item[5],
            status = item[6],
            remarks = item[7]
            # api = api_manager(api_name,model,type,path,headers,token,status,remarks)
            db.session.add(api_manager(api_name=api_name,
                                       model=model,
                                       type=type,
                                       path=path,
                                       headers=headers,
                                       token=token,
                                       status=status,
                                       remarks=remarks))
            db.session.commit()
            db.session.close()
        pass

    __table_args__ = {
        "mysql_charset":"utf8"
    }

if __name__ == "__main__":
    with app.app_context():
        # db.create_all()
        # api_manager().add_data()
        pass
