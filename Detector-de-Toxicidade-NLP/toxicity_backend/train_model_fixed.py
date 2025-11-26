#!/usr/bin/env python
# -*- coding: utf-8 -*-

import pandas as pd
import numpy as np
import warnings
from sklearn.preprocessing import FunctionTransformer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
from nltk.corpus import stopwords
import nltk
import joblib
import sys
import os

# Adicionar o diretório src 
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from src.utils.text_processing import aplicar_clean_text

warnings.filterwarnings('ignore')

# Download stopwords
nltk.download("stopwords", quiet=True)

def train_model():
    """Treina o modelo de detecção de toxicidade"""
    print("Criando dados de exemplo...")
    df = create_sample_data()
    
    print("Preparando dados...")
    X = df['text']
    y = df['toxic']
    
    # Dividir dados
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)
    
    # Configurar pipeline
    stopwords_pt = stopwords.words("portuguese")
    text_cleaner = FunctionTransformer(aplicar_clean_text, validate=False)
    
    # Pipeline completo
    ModeloNLP = Pipeline([
        ('cleaner', text_cleaner),                    
        ('tfidf', TfidfVectorizer(stop_words=stopwords_pt, max_features=10000, ngram_range=(1,2))),
        ('lr', LogisticRegression(max_iter=1000, C=1, penalty='l2', solver='saga'))
    ])
    
    print("Treinando modelo...")
    ModeloNLP.fit(X_train, y_train)
    
    # Validação
    y_pred = ModeloNLP.predict(X_test)
    print("Accuracy:", accuracy_score(y_test, y_pred))
    print("\nClassification Report:\n", classification_report(y_test, y_pred))
    
    # Salvar modelo
    print("Salvando modelo...")
    os.makedirs('src/models', exist_ok=True)
    joblib.dump(ModeloNLP, 'src/models/modelo_toxicidade.joblib')
    print("Modelo salvo com sucesso!")
    
    return ModeloNLP

if __name__ == "__main__":
    train_model()
