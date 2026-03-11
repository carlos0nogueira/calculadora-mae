const formatOptions = { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 };
const formatOptionsDecimals = { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 };

const formatCurrency = (value) => new Intl.NumberFormat('pt-PT', formatOptions).format(value);
const formatCurrencyDecimals = (value) => new Intl.NumberFormat('pt-PT', formatOptionsDecimals).format(value);

const formatShortCurrency = (value) => {
    if (value >= 1000) {
        return (value / 1000) + 'k';
    }
    return value;
};

document.addEventListener('DOMContentLoaded', () => {
    const CAPITAIS_PROPRIOS = 155000;
    
    // Inputs
    const sliderCasa = document.getElementById('slider-casa');
    const inputCasa = document.getElementById('input-casa');
    const sliderEmprestimo = document.getElementById('slider-emprestimo');
    const inputPrazo = document.getElementById('input-prazo');
    const inputJuro = document.getElementById('input-juro');
    // Displays
    const displayEmprestimo = document.getElementById('display-emprestimo');
    const valMinimoEmprestimo = document.getElementById('val-minimo-emprestimo');
    const displayCustoTotal = document.getElementById('display-custo-total');
    const displayPrestacao = document.getElementById('display-prestacao');
    
    // Breakdown
    const breakdownImovel = document.getElementById('breakdown-imovel');
    const breakdownImt = document.getElementById('breakdown-imt');
    const breakdownIs = document.getElementById('breakdown-is');
    const breakdownTotal = document.getElementById('breakdown-total');
    const breakdownEscritura = document.getElementById('breakdown-escritura');
    
    // Labels
    const labelMinEmp = document.getElementById('label-min-emp');

    // Filho Inputs
    const sliderCasaFilho = document.getElementById('slider-casa-filho');
    const inputCasaFilho = document.getElementById('input-casa-filho');
    const sliderEmprestimoFilho = document.getElementById('slider-emprestimo-filho');
    const inputPrazoFilho = document.getElementById('input-prazo-filho');
    const inputJuroFilho = document.getElementById('input-juro-filho');
    // Filho Displays
    const displayCapitaisRestantes = document.getElementById('display-capitais-restantes');
    const displayMaxOrcamento = document.getElementById('display-max-orcamento');
    const breakdownRestantes = document.getElementById('breakdown-restantes');
    const breakdownEmpFilho = document.getElementById('breakdown-emp-filho');
    const breakdownPoderTotal = document.getElementById('breakdown-poder-total');
    
    const breakdownImovelFilho = document.getElementById('breakdown-imovel-filho');
    const breakdownImtFilho = document.getElementById('breakdown-imt-filho');
    const breakdownIsFilho = document.getElementById('breakdown-is-filho');
    const breakdownEscrituraFilho = document.getElementById('breakdown-escritura-filho');
    const breakdownCustoFinalFilho = document.getElementById('breakdown-custo-final-filho');

    const displayEmprestimoFilho = document.getElementById('display-emprestimo-filho');
    const displayPrestacaoFilho = document.getElementById('display-prestacao-filho');

    // Theme Toggle
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = themeToggleBtn.querySelector('i');
    
    // Check initial state
    if(document.body.classList.contains('dark-mode')) {
        themeIcon.classList.replace('ph-moon', 'ph-sun');
    }

    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        if(document.body.classList.contains('dark-mode')) {
            themeIcon.classList.replace('ph-moon', 'ph-sun');
        } else {
            themeIcon.classList.replace('ph-sun', 'ph-moon');
        }
    });

    const calculateIMT = (valorHouse) => {
        // Tabela IMT Portugal 2024 (Habitação Própria Permanente)
        if (valorHouse <= 101917) return 0;
        if (valorHouse <= 139412) return valorHouse * 0.02 - 2038.34;
        if (valorHouse <= 190086) return valorHouse * 0.05 - 6220.70;
        if (valorHouse <= 316772) return valorHouse * 0.07 - 10022.42;
        if (valorHouse <= 633453) return valorHouse * 0.08 - 13190.14;
        if (valorHouse <= 1102920) return valorHouse * 0.06;
        return valorHouse * 0.075;
    };

    const getCustoTotalSimulado = (valor) => {
        const imt = Math.max(0, calculateIMT(valor));
        const is = valor * 0.008;
        return valor + imt + is + 1000;
    };

    const calculateMaxHousePrice = (availableCapital) => {
        if (availableCapital <= 1000) return 0;
        let low = 0;
        let high = availableCapital;
        let maxAff = 0;
        for (let i = 0; i < 40; i++) {
            let mid = (low + high) / 2;
            if (getCustoTotalSimulado(mid) <= availableCapital) {
                maxAff = mid;
                low = mid;
            } else {
                high = mid;
            }
        }
        return Math.floor(maxAff);
    };

    const getCustoTotalSimuladoFilho = (valorCasaFilho) => {
        const imtFilho = Math.max(0, calculateIMT(valorCasaFilho));
        const impostoSeloFilho = valorCasaFilho * 0.008;
        const custosEscrituraFilho = 1000;
        
        let impostosMaisValias = 0;
        if (valorCasaFilho < CAPITAIS_PROPRIOS) {
            const valorNaoReinvestido = CAPITAIS_PROPRIOS - valorCasaFilho;
            impostosMaisValias = valorNaoReinvestido * 0.14; 
        }

        return valorCasaFilho + imtFilho + impostoSeloFilho + custosEscrituraFilho + impostosMaisValias;
    };

    const calculateMaxHousePriceFilho = (availableCapital) => {
        if (availableCapital <= 1000) return 0;
        let low = 0;
        let high = availableCapital;
        let maxAff = 0;
        for (let i = 0; i < 40; i++) {
            let mid = (low + high) / 2;
            if (getCustoTotalSimuladoFilho(mid) <= availableCapital) {
                maxAff = mid;
                low = mid;
            } else {
                high = mid;
            }
        }
        return Math.floor(maxAff);
    };

    const formatInputNumber = (val) => {
        // Remove tudo o que não é dígito
        let clean = val.replace(/\D/g, '');
        if (clean === '') return '';
        // Formata com espaços para milhares
        return new Intl.NumberFormat('pt-PT', { useGrouping: true }).format(parseInt(clean)).replace(/\./g, ' ');
    };

    const parseInputValue = (val) => {
        return parseFloat(val.replace(/\s/g, '')) || 0;
    };

    const updateCalculations = (source) => {
        let valorCasa = parseFloat(sliderCasa.value);
        if (source === 'input-casa') {
            valorCasa = parseInputValue(inputCasa.value);
            sliderCasa.value = valorCasa;
            inputCasa.value = formatInputNumber(inputCasa.value);
        } else {
            inputCasa.value = formatInputNumber(valorCasa.toString());
        }

        let valorEmprestimo = parseFloat(sliderEmprestimo.value);
        const prazoAnos = parseFloat(inputPrazo.value);
        const taxaJuro = parseFloat(inputJuro.value);
        
        // --- 1. Custos e Impostos ---
        const imt = Math.max(0, calculateIMT(valorCasa));
        const impostoSelo = valorCasa * 0.008; // 0.8% selo compra
        const custosEscritura = 1000; // Valor fixo simulado
        const custoTotalHabitacao = valorCasa + imt + impostoSelo + custosEscritura;

        // --- 2. Lógica do Empréstimo Mínimo ---
        const neededLoan = Math.ceil(custoTotalHabitacao - CAPITAIS_PROPRIOS);
        const minEmprestimo = Math.max(0, neededLoan);

        sliderEmprestimo.min = minEmprestimo;
        labelMinEmp.innerText = formatShortCurrency(minEmprestimo);

        // ACOPLAMENTO MÃE: Se alteramos a casa, ou se o empréstimo descera abaixo do mínimo, forçamos o mínimo.
        if (source === 'casa' || source === 'input-casa' || valorEmprestimo < minEmprestimo) {
            valorEmprestimo = minEmprestimo;
            sliderEmprestimo.value = valorEmprestimo;
        }

        // --- 3. Atualizar Vista (DOM) ---
        displayCustoTotal.innerText = formatCurrency(custoTotalHabitacao);
        
        breakdownImovel.innerText = formatCurrency(valorCasa);
        breakdownImt.innerText = formatCurrency(imt);
        breakdownIs.innerText = formatCurrency(impostoSelo);
        breakdownTotal.innerText = formatCurrency(custoTotalHabitacao);
        
        valMinimoEmprestimo.innerText = formatCurrency(minEmprestimo);
        displayEmprestimo.innerText = formatCurrency(valorEmprestimo);

        // --- 4. Cálculo da Prestação (Sistema Francês / Constante) ---
        let prestacao = 0;
        if (valorEmprestimo > 0 && prazoAnos > 0) {
            const meses = prazoAnos * 12;
            const taxaMensal = (taxaJuro / 100) / 12;
            
            if (taxaMensal > 0) {
                // Formula PMT real: P * (r * (1 + r)^n) / ((1 + r)^n - 1)
                prestacao = valorEmprestimo * (taxaMensal * Math.pow(1 + taxaMensal, meses)) / (Math.pow(1 + taxaMensal, meses) - 1);
            } else {
                prestacao = valorEmprestimo / meses;
            }
        }

        displayPrestacao.innerText = formatCurrencyDecimals(prestacao) + ' / mês';

        // --- 5. Lógica do Filho ---
        const capitalGastoMae = Math.max(0, custoTotalHabitacao - valorEmprestimo);
        const capitaisRestantes = Math.max(0, CAPITAIS_PROPRIOS - capitalGastoMae);
        
        // Empréstimo máximo que o filho está disposto a pedir (teto global)
        const valorEmprestimoFilho = parseFloat(sliderEmprestimoFilho.value);
        const prazoAnosFilho = parseFloat(inputPrazoFilho.value);
        const taxaJuroFilho = parseFloat(inputJuroFilho.value);
        
        const poderCompraTotal = capitaisRestantes + valorEmprestimoFilho;
        
        // Lógica de restrição do slider do Filho (Poder de Compra)
        const maxAffordableCasa = Math.max(0, calculateMaxHousePriceFilho(poderCompraTotal));
        const newMinCasa = 50000;
        
        // Atualiza os limites do slider de casa do filho sem "quebrar" se max < min
        sliderCasaFilho.min = newMinCasa;
        sliderCasaFilho.max = Math.max(newMinCasa, maxAffordableCasa);
        
        // ACOPLAMENTO: Se o utilizador aumenta o empréstimo, aumentamos o valor da casa para o máximo
        if (source === 'emp-filho') {
            sliderCasaFilho.value = maxAffordableCasa;
        }
        
        let valorCasaFilho = parseFloat(sliderCasaFilho.value);
        if (source === 'input-casa-filho') {
            valorCasaFilho = parseInputValue(inputCasaFilho.value);
            sliderCasaFilho.value = valorCasaFilho;
            inputCasaFilho.value = formatInputNumber(inputCasaFilho.value);
        } else {
            inputCasaFilho.value = formatInputNumber(valorCasaFilho.toString());
        }

        if (valorCasaFilho > maxAffordableCasa) {
            valorCasaFilho = maxAffordableCasa;
            sliderCasaFilho.value = valorCasaFilho;
            inputCasaFilho.value = formatInputNumber(valorCasaFilho.toString());
        }

        // Ajuste dinâmico de largura para os inputs não "dançarem"
        inputCasa.style.width = ((inputCasa.value.length || 1) + 0.5) + 'ch';
        inputCasaFilho.style.width = ((inputCasaFilho.value.length || 1) + 0.5) + 'ch';

        const labelsCasaFilho = document.querySelectorAll('#slider-casa-filho + .range-labels span');
        if (labelsCasaFilho.length === 2) {
            labelsCasaFilho[1].innerText = formatShortCurrency(maxAffordableCasa);
        }

        // Custos do filho
        const imtFilho = Math.max(0, calculateIMT(valorCasaFilho));
        const impostoSeloFilho = valorCasaFilho * 0.008;
        const custosEscrituraFilho = 1000;
        
        // Calculo das Mais Valias (Mantendo a lógica original conforme pedido)
        let impostosMaisValias = 0;
        if (valorCasaFilho < CAPITAIS_PROPRIOS) {
            const valorNaoReinvestido = CAPITAIS_PROPRIOS - valorCasaFilho;
            impostosMaisValias = valorNaoReinvestido * 0.14; 
        }

        const custoTotalHabitacaoFilho = valorCasaFilho + imtFilho + impostoSeloFilho + custosEscrituraFilho;
        const custoEfetivoFinal = custoTotalHabitacaoFilho + impostosMaisValias;

        // Atualiza Dom do Filho
        const breakdownMaisValias = document.getElementById('breakdown-mais-valias');
        const breakdownCustoEfetivo = document.getElementById('breakdown-custo-efetivo');
        
        // SALDO FINAL: O que sobra após AMBAS as compras (Mãe e Filho)
        const capitalEfetivoFilho = Math.max(0, custoEfetivoFinal - valorEmprestimoFilho);
        const saldoFinal = Math.max(0, capitaisRestantes - capitalEfetivoFilho);

        displayCapitaisRestantes.innerText = formatCurrency(saldoFinal);
        displayEmprestimoFilho.innerText = formatCurrency(valorEmprestimoFilho);
        
        // Headline mostra o custo efetivo final (com mais valias)
        displayMaxOrcamento.innerText = formatCurrency(custoEfetivoFinal);
        
        breakdownImovelFilho.innerText = formatCurrency(valorCasaFilho);
        breakdownImtFilho.innerText = formatCurrency(imtFilho);
        breakdownIsFilho.innerText = formatCurrency(impostoSeloFilho);
        breakdownEscrituraFilho.innerText = formatCurrency(custosEscrituraFilho);
        if (breakdownMaisValias) breakdownMaisValias.innerText = formatCurrency(impostosMaisValias);
        breakdownCustoFinalFilho.innerText = formatCurrency(custoTotalHabitacaoFilho);
        if (breakdownCustoEfetivo) breakdownCustoEfetivo.innerText = formatCurrency(custoEfetivoFinal);

        // Resumo final mostra a soma real (Capital da Mãe + Empréstimo Pedido)
        breakdownRestantes.innerText = formatCurrency(capitaisRestantes);
        breakdownEmpFilho.innerText = formatCurrency(valorEmprestimoFilho);
        breakdownPoderTotal.innerText = formatCurrency(capitaisRestantes + valorEmprestimoFilho);
        
        // Prestação Filho
        let prestacaoFilho = 0;
        if (valorEmprestimoFilho > 0 && prazoAnosFilho > 0) {
            const mesesFilho = prazoAnosFilho * 12;
            const taxaMensalFilho = (taxaJuroFilho / 100) / 12;
            
            if (taxaMensalFilho > 0) {
                prestacaoFilho = valorEmprestimoFilho * (taxaMensalFilho * Math.pow(1 + taxaMensalFilho, mesesFilho)) / (Math.pow(1 + taxaMensalFilho, mesesFilho) - 1);
            } else {
                prestacaoFilho = valorEmprestimoFilho / mesesFilho;
            }
        }
        displayPrestacaoFilho.innerText = formatCurrencyDecimals(prestacaoFilho) + ' / mês';
    };

    // Events
    sliderCasa.addEventListener('input', () => updateCalculations('casa'));
    inputCasa.addEventListener('input', () => updateCalculations('input-casa'));
    sliderEmprestimo.addEventListener('input', () => updateCalculations('emprestimo'));
    inputPrazo.addEventListener('input', () => updateCalculations('prazo'));
    inputJuro.addEventListener('input', () => updateCalculations('juro'));

    sliderCasaFilho.addEventListener('input', () => updateCalculations('casa-filho'));
    inputCasaFilho.addEventListener('input', () => updateCalculations('input-casa-filho'));
    sliderEmprestimoFilho.addEventListener('input', () => updateCalculations('emp-filho'));
    inputPrazoFilho.addEventListener('input', () => updateCalculations('prazo-filho'));
    inputJuroFilho.addEventListener('input', () => updateCalculations('juro-filho'));

    // Init
    updateCalculations('init');
});
