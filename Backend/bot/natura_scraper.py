# # natura_scraper.py
# import sys
# import requests
# from bs4 import BeautifulSoup
# import json

# def extrair_dados(link):
#     headers = {
#         'User-Agent': 'Mozilla/5.0',
#         'Accept-Language': 'pt-BR,pt;q=0.9'
#     }

#     response = requests.get(link, headers=headers)
#     soup = BeautifulSoup(response.text, 'html.parser')

#     titulo = soup.find('h1')
#     preco_elem = soup.find(id='product-price')
#     imagem = soup.find('img', {'id': 'product-image'}) or soup.find('img')

#     if not titulo or not preco_elem or not imagem:
#         return None

#     preco_texto = preco_elem.get('aria-label') or preco_elem.get_text()
#     preco_texto = preco_texto.replace('R$', '').replace(',', '.').strip()
#     preco = float(''.join(filter(lambda x: x.isdigit() or x == '.', preco_texto)))

#     return {
#         'titulo': titulo.text.strip(),
#         'preco': f'R$ {preco:.2f}'.replace('.', ','),
#         'preco_num': preco,
#         'image': imagem['src'] if imagem['src'].startswith('http') else f'https:{imagem["src"]}',
#         'link': link
#     }

# if __name__ == '__main__':
#     link = sys.argv[1]
#     resultado = extrair_dados(link)
#     print(json.dumps(resultado if resultado else {
#         'titulo': 'Erro ao extrair dados',
#         'preco': '',
#         'preco_num': 0,
#         'image': '',
#         'link': link
#     }))
