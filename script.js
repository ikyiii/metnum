let chartInstance = null;

function evaluateFunction(func, x) {
    try {
        func = func.replace(/\^/g, '**');
        func = func.replace(/e/g, Math.E);
        return Function('x', `return ${func}`)(x);
    } catch (e) {
        return NaN;
    }
}

function evaluateFunctionDerivative(func, x) {
    const delta = 1e-6;
    const fXPlusDelta = evaluateFunction(func, x + delta);
    const fX = evaluateFunction(func, x);
    return (fXPlusDelta - fX) / delta;
}

function formatNumber(num) {
    return Number(num.toFixed(6));
}

function createIterationBlock(iteration, calculations, result) {
    return `
        <div class="iteration-block">
            <div class="iteration-title">Iterasi ${iteration}</div>
            <div class="calculation-steps">${calculations}</div>
            <div>Hasil: ${result}</div>
        </div>
    `;
}

function calculateRoot() {
    if (!validateInputs()) return;

    const method = document.getElementById('method').value;
    const resultDiv = document.getElementById('result');
    
    // Tambahkan judul sesuai metode yang dipilih
    let methodTitle = '';
    switch(method) {
        case 'secant':
            methodTitle = 'Hasil Perhitungan Metode Secant';
            break;
        case 'bisection':
            methodTitle = 'Hasil Perhitungan Metode Bisection';
            break;
        case 'regulaFalsi':
            methodTitle = 'Hasil Perhitungan Metode Regula Falsi';
            break;
        case 'newtonRaphson':
            methodTitle = 'Hasil Perhitungan Metode Newton-Raphson';
            break;
        default:
            methodTitle = 'Hasil Perhitungan';
    }
    resultDiv.innerHTML = `<div class="method-title">${methodTitle}</div>`;

    switch(method) {
        case 'secant':
            calculateRootSecant();
            break;
        case 'bisection':
            calculateRootBisection();
            break;
        case 'regulaFalsi':
            calculateRootRegulaFalsi();
            break;
        case 'newtonRaphson':
            calculateRootNewtonRaphson();
            break;
        default:
            alert('Metode tidak valid');
    }
}

function validateInputs() {
    const func = document.getElementById('function').value;
    const x0 = parseFloat(document.getElementById('x0').value);
    const x1 = parseFloat(document.getElementById('x1').value);
    const tolerance = parseFloat(document.getElementById('tolerance').value);
    const maxIterations = parseInt(document.getElementById('maxIterations').value);

    if (func.trim() === '') {
        alert('Fungsi tidak boleh kosong.');
        return false;
    }
    
    if (isNaN(x0)) {
        alert('Nilai x0 harus berupa angka.');
        return false;
    }

    if (isNaN(x1)) {
        alert('Nilai x1 harus berupa angka.');
        return false;
    }

    if (isNaN(tolerance) || tolerance <= 0) {
        alert('Toleransi harus berupa angka positif.');
        return false;
    }

    if (isNaN(maxIterations) || maxIterations <= 0) {
        alert('Maksimum iterasi harus berupa angka positif.');
        return false;
    }

    return true;
}

function calculateRootSecant() {
    const func = document.getElementById('function').value;
    let x0 = parseFloat(document.getElementById('x0').value);
    let x1 = parseFloat(document.getElementById('x1').value);
    const tolerance = parseFloat(document.getElementById('tolerance').value);
    const maxIterations = parseInt(document.getElementById('maxIterations').value);

    let resultDiv = document.getElementById('result');
    let originalContent = resultDiv.innerHTML; // Simpan judul
    resultDiv.innerHTML = originalContent; // Kembalikan judul

    let iteration = 0;
    let x2;
    let data = [];

    document.querySelector('.output-section').style.display = 'block';

    while (iteration < maxIterations) {
        const f0 = evaluateFunction(func, x0);
        const f1 = evaluateFunction(func, x1);

        if (Math.abs(f1 - f0) < 1e-10) {
            resultDiv.innerHTML = 'Error: Pembagian dengan nol terdeteksi.';
            return;
        }

        x2 = x1 - (f1 * (x1 - x0)) / (f1 - f0);
        data.push({ iteration: iteration + 1, x: x2 });

        const calculations = `Langkah-langkah perhitungan:
f(x0) = f(${formatNumber(x0)}) = ${formatNumber(f0)}
f(x1) = f(${formatNumber(x1)}) = ${formatNumber(f1)}

x2 = x1 - [f(x1)(x1 - x0)] / [f(x1) - f(x0)]
x2 = ${formatNumber(x1)} - [${formatNumber(f1)}(${formatNumber(x1)} - ${formatNumber(x0)})] / [${formatNumber(f1)} - ${formatNumber(f0)}]
x2 = ${formatNumber(x2)}

Error = |x2 - x1| = |${formatNumber(x2)} - ${formatNumber(x1)}| = ${formatNumber(Math.abs(x2 - x1))}`;

        resultDiv.innerHTML += createIterationBlock(iteration + 1, calculations, `x = ${formatNumber(x2)}`);

        if (Math.abs(x2 - x1) < tolerance) {
            resultDiv.innerHTML += `<br>Akar ditemukan: <b>${formatNumber(x2)}</b> setelah ${iteration + 1} iterasi.`;
            visualizeData(data);
            return;
        }

        x0 = x1;
        x1 = x2;
        iteration++;
    }

    resultDiv.innerHTML += `Akar tidak ditemukan setelah maksimum iterasi (${maxIterations}).`;
    visualizeData(data);
}

function calculateRootBisection() {
    const func = document.getElementById('function').value;
    let a = parseFloat(document.getElementById('x0').value);
    let b = parseFloat(document.getElementById('x1').value);
    const tolerance = parseFloat(document.getElementById('tolerance').value);
    const maxIterations = parseInt(document.getElementById('maxIterations').value);

    let resultDiv = document.getElementById('result');
    let originalContent = resultDiv.innerHTML; // Simpan judul
    resultDiv.innerHTML = originalContent; // Kembalikan judul

    let iteration = 0;
    let c;
    let data = [];

    document.querySelector('.output-section').style.display = 'block';


    while (iteration < maxIterations) {
        c = (a + b) / 2;
        const fA = evaluateFunction(func, a);
        const fB = evaluateFunction(func, b);
        const fC = evaluateFunction(func, c);

        data.push({ iteration: iteration + 1, x: c });

        const calculations = `Langkah-langkah perhitungan:
a = ${formatNumber(a)}
b = ${formatNumber(b)}
f(a) = f(${formatNumber(a)}) = ${formatNumber(fA)}
f(b) = f(${formatNumber(b)}) = ${formatNumber(fB)}

c = (a + b) / 2
c = (${formatNumber(a)} + ${formatNumber(b)}) / 2
c = ${formatNumber(c)}

f(c) = f(${formatNumber(c)}) = ${formatNumber(fC)}

Pengecekan interval baru:
f(a) × f(c) = ${formatNumber(fA)} × ${formatNumber(fC)} = ${formatNumber(fA * fC)}
${fA * fC < 0 ? 'f(a) × f(c) < 0, maka b = c' : 'f(a) × f(c) > 0, maka a = c'}

Error = |b - a| = |${formatNumber(b)} - ${formatNumber(a)}| = ${formatNumber(Math.abs(b - a))}`;

        resultDiv.innerHTML += createIterationBlock(iteration + 1, calculations, `c = ${formatNumber(c)}`);

        if (Math.abs(fC) < tolerance || Math.abs(b - a) < tolerance) {
            resultDiv.innerHTML += `<br>Akar ditemukan: <b>${formatNumber(c)}</b> setelah ${iteration + 1} iterasi.`;
            visualizeData(data);
            return;
        }

        if (fA * fC < 0) {
            b = c;
        } else {
            a = c;
        }

        iteration++;
    }

    resultDiv.innerHTML += `Akar tidak ditemukan setelah maksimum iterasi (${maxIterations}).`;
    visualizeData(data);
}

function calculateRootRegulaFalsi() {
    const func = document.getElementById('function').value;
    let a = parseFloat(document.getElementById('x0').value);
    let b = parseFloat(document.getElementById('x1').value);
    const tolerance = parseFloat(document.getElementById('tolerance').value);
    const maxIterations = parseInt(document.getElementById('maxIterations').value);

    let resultDiv = document.getElementById('result');
    let originalContent = resultDiv.innerHTML; // Simpan judul
    resultDiv.innerHTML = originalContent; // Kembalikan judul

    let iteration = 0;
    let c;
    let data = [];

    document.querySelector('.output-section').style.display = 'block';

    while (iteration < maxIterations) {
        const fA = evaluateFunction(func, a);
        const fB = evaluateFunction(func, b);
        
        c = b - (fB * (b - a)) / (fB - fA);
        const fC = evaluateFunction(func, c);

        data.push({ iteration: iteration + 1, x: c });

        const calculations = `Langkah-langkah perhitungan:
a = ${formatNumber(a)}
b = ${formatNumber(b)}
f(a) = f(${formatNumber(a)}) = ${formatNumber(fA)}
f(b) = f(${formatNumber(b)}) = ${formatNumber(fB)}

c = b - [f(b)(b - a)] / [f(b) - f(a)]
c = ${formatNumber(b)} - [${formatNumber(fB)}(${formatNumber(b)} - ${formatNumber(a)})] / [${formatNumber(fB)} - ${formatNumber(fA)}]
c = ${formatNumber(c)}

f(c) = f(${formatNumber(c)}) = ${formatNumber(fC)}

Pengecekan interval baru:
f(a) × f(c) = ${formatNumber(fA)} × ${formatNumber(fC)} = ${formatNumber(fA * fC)}
${fA * fC < 0 ? 'f(a) × f(c) < 0, maka b = c' : 'f(a) × f(c) > 0, maka a = c'}

Error = |c - ${fA * fC < 0 ? 'b' : 'a'}| = |${formatNumber(c)} - ${formatNumber(fA * fC < 0 ? b : a)}| = ${formatNumber(Math.abs(c - (fA * fC < 0 ? b : a)))}`;

        resultDiv.innerHTML += createIterationBlock(iteration + 1, calculations, `c = ${formatNumber(c)}`);

        if (Math.abs(fC) < tolerance) {
            resultDiv.innerHTML += `<br>Akar ditemukan: <b>${formatNumber(c)}</b> setelah ${iteration + 1} iterasi.`;
            visualizeData(data);
            return;
        }

        if (fA * fC < 0) {
            b = c;
        } else {
            a = c;
        }

        iteration++;
    }

    resultDiv.innerHTML += `Akar tidak ditemukan setelah maksimum iterasi (${maxIterations}).`;
    visualizeData(data);
}

function calculateRootNewtonRaphson() {
    const func = document.getElementById('function').value;
    let x0 = parseFloat(document.getElementById('x0').value);
    const tolerance = parseFloat(document.getElementById('tolerance').value);
    const maxIterations = parseInt(document.getElementById('maxIterations').value);

    let resultDiv = document.getElementById('result');
    let originalContent = resultDiv.innerHTML; // Simpan judul
    resultDiv.innerHTML = originalContent; // Kembalikan judul

    let iteration = 0;
    let x1 = x0;
    let data = [];

    document.querySelector('.output-section').style.display = 'block';


    while (iteration < maxIterations) {
        const fx = evaluateFunction(func, x1);
        const fPrime = evaluateFunctionDerivative(func, x1);

        if (Math.abs(fPrime) < 1e-10) {
            resultDiv.innerHTML = 'Error: Turunan fungsi mendekati nol.';
            return;
        }

        const x2 = x1 - fx / fPrime;
        data.push({ iteration: iteration + 1, x: x2 });

        const calculations = `Langkah-langkah perhitungan:
x1 = ${formatNumber(x1)}
f(x1) = f(${formatNumber(x1)}) = ${formatNumber(fx)}
f'(x1) = ${formatNumber(fPrime)}

x2 = x1 - f(x1)/f'(x1)
x2 = ${formatNumber(x1)} - ${formatNumber(fx)}/${formatNumber(fPrime)}
x2 = ${formatNumber(x2)}

Error = |x2 - x1| = |${formatNumber(x2)} - ${formatNumber(x1)}| = ${formatNumber(Math.abs(x2 - x1))}`;

        resultDiv.innerHTML += createIterationBlock(iteration + 1, calculations, `x = ${formatNumber(x2)}`);

        if (Math.abs(x2 - x1) < tolerance) {
            resultDiv.innerHTML += `<br>Akar ditemukan: <b>${formatNumber(x2)}</b> setelah ${iteration + 1} iterasi.`;
            visualizeData(data);
            return;
        }

        x1 = x2;
        iteration++;
    }

    resultDiv.innerHTML += `Akar tidak ditemukan setelah maksimum iterasi (${maxIterations}).`;
    visualizeData(data);
}

function visualizeData(data) {
    const ctx = document.getElementById('chart').getContext('2d');
    if (chartInstance) {
        chartInstance.destroy();
    }
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(item => `Iterasi ${item.iteration}`),
            datasets: [{
                label: 'Nilai Akar',
                data: data.map(item => item.x),
                borderColor: '#007bff',
                fill: false,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Iterasi'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Nilai Akar'
                    }
                }
            }
        }
    });
}

function resetInputs() {
    document.getElementById('function').value = '';
    document.getElementById('x0').value = '';
    document.getElementById('x1').value = '';
    document.getElementById('tolerance').value = '';
    document.getElementById('maxIterations').value = '';
    document.getElementById('method').value = 'secant';
    document.getElementById('result').innerHTML = '';
    document.querySelector('.output-section').style.display = 'none';
    if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
    }
}