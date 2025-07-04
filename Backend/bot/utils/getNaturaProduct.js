import axios from 'axios';
import * as cheerio from 'cheerio';

export function isNaturaLink(link) {
  return link.includes('natura.com.br');
}

export async function getNaturaProductInfo(link) {
  try {
    const { data: html } = await axios.get(link, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
        'Accept-Language': 'pt-BR,pt;q=0.9',
      }
    });

    const $ = cheerio.load(html);
const produtoEsperado = link.split('/').pop().split('?')[0].toLowerCase();
 
    // 🏷️ Título (tentativa com fallback)
    const title = $('h1.text-2xl').first().text().trim();
    console.log('📦 Título:', title);


  let price = 0;

    // Estratégia principal: selecionar dentro da seção de preço principal, ignorando valores riscados
    const container = $('#product-price');
    const spans = container.find('span');

    const precosFiltrados = spans
      .toArray()
      .map(el => {
        const text = $(el).text().trim();
        const match = text.match(/(\d{1,3}(?:\.\d{3})*,\d{2})/);
        if (match && !$(el).attr('class')?.includes('line-through')) {
          return parseFloat(match[1].replace(/\./g, '').replace(',', '.'));
        }
        return null;
      })
      .filter(v => v !== null && !isNaN(v));

    if (precosFiltrados.length) {
      price = Math.max(...precosFiltrados); // pega o maior valor visível (sem riscado)
    }

    // Fallback se não encontrar
    if (!price || isNaN(price)) {
      const precos = [];
      $('span').each((_, el) => {
        const span = $(el);
        const classAttr = span.attr('class') || '';
        const raw = span.text().trim();
        const match = raw.match(/(\d{1,3}(?:\.\d{3})*,\d{2})/);

        if (match) {
          const value = parseFloat(match[1].replace(/\./g, '').replace(',', '.'));
          if (!isNaN(value) && value < 10000) {
            precos.push({ value, text: raw, classAttr });
          }
        }
      });

      if (!precos.length) {
        throw new Error('❌ Nenhum preço encontrado na página.');
      }

      precos.sort((a, b) => b.value - a.value);
      const precoFinal = precos.find(p => !p.classAttr.includes('line-through')) || precos[0];
      price = precoFinal.value;
    }

    console.log('💰 Preço final identificado:', price);


    // 🖼️ Imagem
    let image = $('img#product-image').attr('src') ||
                $('img[alt*="produto"]').attr('src') ||
                $('img').first().attr('src');

                console.log(image)

    if (image && !image.startsWith('http')) {
      image = 'https:' + image;
    }

    if (!title || isNaN(price) || !image) {
      throw new Error('❌ Produto retornou dados incompletos.');
    }

    return {
      title: title,
      price: `${price.toFixed(2).replace('.', ',')}`,
      preco_num: price,
      image,
      link
    };

  } catch (error) {
    console.error('❌ Erro ao extrair produto:', error.message);
    return {
      title: 'Erro ao extrair dados',
      price: '',
      image: '',
      link
    };
  }
}
