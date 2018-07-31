"""
api.py
- provides the API endpoints for consuming and producing REST
requests and responses
"""

from functools import wraps
from datetime import datetime, timedelta

import jwt

from flask import Blueprint, jsonify, request, current_app
from .models import db, Survey, Question, Choice, User

api = Blueprint('api',__name__)

@api.route('/register/',methods=('POST',))
def register():
    data = request.get_json()
    user = User(**data)
    db.session.add(user)
    db.session.commit()
    return jsonify(user.to_dict()), 201

@api.route('/login/', methods=('POST',))
def login():
    data = request.get_json()
    user = User.authenticate(**data)

    if not user:
        return jsonify({ 'message': 'Invalid credentials', 'authenticated': False }), 401

    token = jwt.encode({
        'sub': user.email,
        'iat': datetime.utcnow(),
        'exp': datetime.utcnow() + timedelta(minutes=30)
    }, current_app.config['SECRET_KEY'])

    return jsonify({ 'token': token.decode('UTF-8') })

@api.route('/surveys/',methods=('GET','POST'))
def surveys():
    if request.method == 'GET':
        surveys = Survey.query.all()
        return jsonify([s.to_dict() for s in surveys])
    elif request.method == 'POST':
        data = request.get_json()
        survey = Survey(name=data['name'])
        questions = []
        for q in data['questions']:
            question = Question(text=q['text'])
            question.choices = [Choice(text=c['text']) for c in q['choices']]
            questions.append(question)
        survey.questions = questions
        db.session.add(survey)
        db.session.commit()
        return jsonify(survey.to_dict()), 201

@api.route('/surveys/<int:id>/',methods=('GET','PUT'))
def survey(id):
    if request.method == 'GET':
        survey = Survey.query.get(id)
        return jsonify(survey.to_dict())
    elif request.method == 'PUT':
        data = request.get_json()
        for q in data['questions']:
            choice = Choice.query.get(q['choice'])
            choice.selected = choice.selected + 1
        db.session.commit()
        survey = Survey.query.get(data['id'])
        return jsonify(survey.to_dict()), 201
