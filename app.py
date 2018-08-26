from flask import Flask, jsonify, request, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

# initialize
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///List.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True

db = SQLAlchemy(app)
migrate = Migrate(app, db)


# models
class Mission(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=True)
    done = db.Column(db.Integer)

# views
@app.route('/')
def index():
    return render_template('index.html')


@app.route('/record', methods=['GET'])
def get_missions():
    records = Mission.query.all()
    records_data = [
        {
            'id': record.id,
            'title': record.title,
            'done': record.done
        }
        for record in records
    ]
    return jsonify(records_data), 200

@app.route('/record', methods=['POST'])
def add_mission():
    req_data = request.form
    title = req_data['title']
    done = req_data['done']
    record = Mission(title=title, done=done)
    db.session.add(record)
    db.session.commit()
    return 'Create Succeeded', 200

@app.route('/record/<int:record_id>', methods=['PUT'])
def update_record(record_id):
    req_data = request.form
    record = Mission.query.filter_by(id=record_id).first()
    record.title = req_data['title']
    db.session.add(record)
    db.session.commit()
    return 'Update Succeeded', 200

@app.route('/record/<int:record_id>/done', methods=['PUT'])
def updata_done(record_id):
    req_data = request.form
    record = Mission.query.filter_by(id=record_id).first()
    record.done = req_data['done']
    db.session.add(record)
    db.session.commit()
    return 'Update Succeeded', 200
    '''
    req_data = request.form
    record = Mission.query.filter_by(id=record_id).first()
    record.done = req_data['done']
    db.session.add(record)
    db.session.commit()
    return 'Update Succeeded', 200
    '''

@app.route('/record/<int:record_id>', methods=['DELETE'])
def delete_record(record_id):
    record = Mission.query.filter_by(id=record_id).first()
    db.session.delete(record)
    db.session.commit()
    return 'Delete Succeeded', 200
