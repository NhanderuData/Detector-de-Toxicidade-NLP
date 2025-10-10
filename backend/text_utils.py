import re
import string
from sklearn.preprocessing import FunctionTransformer
from nltk.corpus import stopwords
import nltk

# Baixar stopwords se necessário
try:
    stopwords.words("portuguese")
except LookupError:
    nltk.download("stopwords")

def remove_urls(text):
    return re.sub(r'http\S+', '', text)

def remove_mentions(text):
    return re.sub(r'@\w+', '', text)

def remove_emojis(text):
    emoji_pattern = re.compile("[\U00010000-\U0010FFFF]", flags=re.UNICODE)
    return emoji_pattern.sub(r'', text)

def remove_special_chars(text):
    allowed_chars = set(string.ascii_letters + "áéíóúãõàâêôç ")
    return ''.join(c for c in text if c in allowed_chars)

def clean_text(text):
    if not isinstance(text, str):
        return '' 
    
    text = text.lower().strip() 
    text = remove_urls(text)
    text = remove_mentions(text)
    text = remove_emojis(text)
    text = re.sub(r'\s+', ' ', text) 
    
    return text

def aplicar_clean_text(X):
    """Função para aplicar limpeza de texto em uma Series do pandas"""
    return X.apply(clean_text)

# Criar o transformer para uso no pipeline
text_cleaner = FunctionTransformer(aplicar_clean_text, validate=False)
