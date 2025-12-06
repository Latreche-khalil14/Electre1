let criteriaCount = 0;
let actionCount = 0;
let values = [];
let weights = [];

const txtCriteria = document.getElementById("txtCriteria");
const txtActions = document.getElementById("txtActions");
const btnCreate = document.getElementById("btnCreate");
const matrixAndThresholds = document.getElementById("matrixAndThresholds");
const matrixContainer = document.getElementById("matrixContainer");
const resultsContainer = document.getElementById("resultsContainer");
const txtCSeuil = document.getElementById("txtCSeuil");
const txtDSeuil = document.getElementById("txtDSeuil");
const btnCompute = document.getElementById("btnCompute");
const btnCompare = document.getElementById("btnCompare");
const btnReset = document.getElementById("btnReset");
const matrixCard = document.getElementById("matrixCard");
const resultsCard = document.getElementById("resultsCard");

btnCreate.addEventListener("click", () => {
    criteriaCount = parseInt(txtCriteria.value);
    actionCount = parseInt(txtActions.value);
    if(criteriaCount <=0 || actionCount <=0){ alert("Valeurs valides nécessaires."); return; }

    values = Array.from({length: actionCount}, ()=> Array(criteriaCount).fill(0));
    weights = Array(criteriaCount).fill(1);

    renderMatrix();
    matrixAndThresholds.classList.remove("hidden");
    matrixCard.classList.remove("hidden");
    resultsCard.classList.add("hidden");
    btnCompute.disabled=false;
    btnCompare.disabled=true;
});

function renderMatrix() {
    let html = `<table><thead><tr><th>Action / Critère</th>`;
    for(let j=0;j<criteriaCount;j++) html += `<th>C${j+1}</th>`;
    html += `</tr></thead><tbody>`;
    for(let i=0;i<actionCount;i++){
        html += `<tr><td>A${i+1}</td>`;
        for(let j=0;j<criteriaCount;j++){
            html += `<td><input type="number" step="0.01" value="${values[i][j]}" data-i="${i}" data-j="${j}"></td>`;
        }
        html += `</tr>`;
    }
    html += `<tr><td>Poids</td>`;
    for(let j=0;j<criteriaCount;j++){
        html += `<td><input type="number" step="0.01" value="${weights[j]}" data-weight="${j}"></td>`;
    }
    html += `</tr></tbody></table>`;
    matrixContainer.innerHTML = html;

    matrixContainer.querySelectorAll("input").forEach(input=>{
        input.addEventListener("input", ()=>{
            if(input.dataset.i!==undefined) values[input.dataset.i][input.dataset.j] = parseFloat(input.value) || 0;
            else if(input.dataset.weight!==undefined) weights[input.dataset.weight] = parseFloat(input.value) || 0;
        });
    });
}

function computeConcordance() {
    let C = Array.from({length: actionCount}, ()=> Array(actionCount).fill(0));
    let sumW = weights.reduce((a,b)=>a+b,0);
    if(sumW===0) sumW=1;
    for(let i=0;i<actionCount;i++){
        for(let j=0;j<actionCount;j++){
            if(i===j) continue;
            let s=0;
            for(let k=0;k<criteriaCount;k++){
                if(values[i][k]>=values[j][k]) s+=weights[k];
            }
            C[i][j] = s/sumW;
        }
    }
    return C;
}

function computeDiscordance() {
    let D = Array.from({length: actionCount}, ()=> Array(actionCount).fill(0));
    let flat = values.flat();
    let minVal = Math.min(...flat);
    let maxVal = Math.max(...flat);
    let range = maxVal - minVal;
    if(range===0) range=1;
    for(let i=0;i<actionCount;i++){
        for(let j=0;j<actionCount;j++){
            if(i===j) continue;
            let maxDiff=0;
            for(let k=0;k<criteriaCount;k++){
                let diff = values[j][k]-values[i][k];
                if(diff>maxDiff) maxDiff=diff;
            }
            D[i][j] = maxDiff/range;
        }
    }
    return D;
}

btnCompute.addEventListener("click",()=>{
    resultsContainer.innerHTML = ""; 
    let C = computeConcordance();
    let D = computeDiscordance();
    renderMatrixResult(C,"Concordance");
    renderMatrixResult(D,"Discordance");
    resultsCard.classList.remove("hidden");
    btnCompare.disabled=false;
});

function renderMatrixResult(mat,title){
    let html = `<h3>${title}</h3><table><thead><tr><th></th>`;
    for(let j=0;j<actionCount;j++) html+=`<th>A${j+1}</th>`;
    html+=`</tr></thead><tbody>`;
    for(let i=0;i<actionCount;i++){
        html+=`<tr><td>A${i+1}</td>`;
        for(let j=0;j<actionCount;j++){
            if(i===j) html+=`<td></td>`;
            else html+=`<td>${mat[i][j].toFixed(2)}</td>`;
        }
        html+=`</tr>`;
    }
    html+=`</tbody></table>`;
    resultsContainer.innerHTML += html;
}

btnCompare.addEventListener("click",()=>{
    resultsContainer.innerHTML = ""; 
    let Tc = parseFloat(txtCSeuil.value);
    let Td = parseFloat(txtDSeuil.value);
    if(isNaN(Tc) || isNaN(Td) || Tc<0 || Tc>1 || Td<0 || Td>1){ alert("Seuils invalides."); return; }
    let C = computeConcordance();
    let D = computeDiscordance();
    let surclassements=[];
    for(let i=0;i<actionCount;i++){
        for(let j=0;j<actionCount;j++){
            if(i===j) continue;
            if(C[i][j]>=Tc && D[i][j]<=Td) surclassements.push(`A${i+1} surclasse A${j+1}`);
        }
    }
    let html="<h3>Surclassements</h3>";
    if(surclassements.length===0) html+="<p>Aucun surclassement avec ces seuils.</p>";
    else html+="<ul>"+surclassements.map(s=>`<li>${s}</li>`).join("")+"</ul>";
    resultsContainer.innerHTML = html;
});

btnReset.addEventListener("click",()=>{
    matrixAndThresholds.classList.add("hidden");
    matrixCard.classList.add("hidden");
    resultsCard.classList.add("hidden");
    btnCompute.disabled=true;
    btnCompare.disabled=true;
});
