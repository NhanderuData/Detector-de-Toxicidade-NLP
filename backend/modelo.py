import re, string
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import FunctionTransformer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
import nltk

nltk.download('stopwords')  # garante que as stopwords existem
from nltk.corpus import stopwords

def clean_text(text):   
    if not isinstance(text, str):
        return ''
    text = text.lower().strip()
    text = remove_urls(text)
    text = remove_mentions(text)
    text = remove_emojis(text)
    text = re.sub(r'\s+', ' ', text)
    return text

# ... funções remove_urls, remove_mentions, remove_emojis ...

stopwords_pt = stopwords.words("portuguese")
text_cleaner = FunctionTransformer(clean_text, validate=False)

ModeloNLP = Pipeline([
    ('cleaner', text_cleaner),
    ('tfidf', TfidfVectorizer(stop_words=stopwords_pt, max_features=10000, ngram_range=(1,2))),
    ('lr', LogisticRegression(max_iter=1000, C=1, penalty='l2', solver='saga'))
])
