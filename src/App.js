import { useState } from 'react';
import './App.scss';
import logo from './assets/balandralogo.png'
import logo1 from './assets/logobalandra.png'
import img1 from './assets/img1.jpeg'
import img2 from './assets/img2.jpeg'
import img3 from './assets/img3.jpeg'
import img4 from './assets/img4.jpeg'
import {ReactComponent as Trash} from './assets/trash.svg'
import {ReactComponent as Add} from './assets/add.svg'
import CSVReader from 'react-csv-reader'
import app from 'firebase'
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';


function App() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentProduct, setCurrentProduct] = useState({})
  const [prodsData, setProdsData] = useState([])
  const [currentProductsCalculator, setCurrentProductsCalculator] = useState([])
  const [currentProductCalculator, setCurrentProductCalculator] = useState({})
  const [rows, setRows] = useState([])

  function redondearDosDecimales(num){
    return Math.round((num + Number.EPSILON) * 100) / 100
  }

  return (
    <div className="App">
      <div className="App-navbar">
        <div className="App-navbarHeader">
          <img src={logo} alt="logo"></img>
          <p>Usuario Anónimo</p>
        </div>
        <div className="App-navbarItemsContainer">
          <div className="App-navbarItem" style={{backgroundColor: currentIndex===0?"#D18C02":"#FFA500" }} onClick={()=>setCurrentIndex(0)}>Inicio</div>
          <div className="App-navbarItem" style={{backgroundColor: currentIndex===1?"#D18C02":"#FFA500" }} onClick={()=>setCurrentIndex(1)}>Calculadora</div>
          <div className="App-navbarItem" style={{backgroundColor: currentIndex===2?"#D18C02":"#FFA500" }} onClick={()=>setCurrentIndex(2)}>Agregar Alimentos</div>
          <div className="App-navbarItem" style={{backgroundColor: currentIndex===3?"#D18C02":"#FFA500" }} onClick={()=>setCurrentIndex(3)}>Bibliografía</div>
        </div>
        <div className="App-navbarFooter">
          <p>Creado por: Gabriela Laica</p>
        </div>
      </div>
      <div className="App-content">
        {currentComponent()}
      </div>
      <div id="App-addProductModal" className="modal">
        <div className="modal-content">
          <span className="close" onClick={()=>handleModal("App-addProductModal", false)}>&times;</span>
          <div className="App-formContainer">
            <h4>Palabra clave</h4>
            <input id="keywordSearch" placeholder="Palabra clave para la búsqueda"></input>
            <button onClick={searchProducts}>Buscar</button>
          </div>
          <div className="App-formContainer">
            <h4>Seleccione un producto</h4>
            <select id="productSelect" onChange={onProductSelectChange}>
              <option value="">Seleccione un producto</option>
            </select>
            <div className="App-productDataContainer">
              <h4>Código: {currentProductCalculator.codigo}</h4>
              <h4>Categoría: {currentProductCalculator.categoriaNombre}</h4>
              <h4>Nombre: {currentProductCalculator.nombre}</h4>
              <h4>Proteínas: {currentProductCalculator.proteinas} kcal</h4>
              <h4>Grasas: {currentProductCalculator.grasas} kcal</h4>
              <h4>Carbohidratos: {currentProductCalculator.carbohidratos} kcal</h4>
              <h4>Cantidad: <input type="text" id="quantityInput" placeholder="Ingrese la cantidad"></input> gr</h4>
            </div>
            <button onClick={addProduct}>Agregar</button>
          </div>
        </div>
      </div>
    </div>
  );

  function onProductSelectChange(e){
    if(e.target.value!==""){
      let prds = currentProductsCalculator.filter(element=>element.id===e.target.value)
      setCurrentProductCalculator({
        id: prds[0].id,
        nombre: prds[0].nombre,
        categoria: prds[0].categoria,
        categoriaNombre: getCategoryName(prds[0].categoria),
        codigo: prds[0].codigo,
        proteinas: prds[0].proteinas,
        grasas: prds[0].grasas,
        carbohidratos: prds[0].carbohidratos
      })
    }else{
      setCurrentProductCalculator({})
    }
  }

  function getCategoryName(id){
    switch(id){
      case "01":{
        return "PRODUCTOS LACTEOS Y SIMILARES"
      }
      case "02":{
        return "HUEVOS"
      }
      case "03":{
        return "CARNE DE AVES"
      }
      case "04":{
        return "CARNE DE CERDO"
      }
      case "05":{
        return "CARNE DE VACUNO"
      }
      case "06":{
        return "CARNE DE CAZA"
      }
      case "07":{
        return "EMBUTIDOS Y SIMILARES"
      }
      case "08":{
        return "MARISCOS PESCADOS"
      }
      case "09":{
        return "LEGUMINOSAS; GRANOS SECOS Y DERIVADOS"
      }
      case "10":{
        return "NUECES Y SEMILLAS"
      }
      case "11":{
        return "VERDURAS; HORTALIZAS Y OTROS VEGETALES"
      }
      case "12":{
        return "FRUTAS Y JUGOS DE FRUTAS"
      }
      case "13":{
        return "CEREALES; GRABOS SECOS; HARINAS Y PASTAS"
      }
      case "14":{
        return "GALLETAS; PANES; TORTILLAS Y SIMILARES"
      }
      case "15":{
        return "AZUCARES; MIELES; DULCES Y GOLOSINAS"
      }
      case "16":{
        return "ACEITES Y GRASAS"
      }
      case "17":{
        return "BEBIDAS DIVERSAS"
      }
      case "18":{
        return "POSTRES"
      }
      case "19":{
        return "COMIDAS INFANTILES"
      }
      case "20":{
        return "ADEREZOS; SALSAS Y SOPAS"
      }
      case "21":{
        return "COMIDAS PREPARADAS: COMERCIALES Y CASERAS"
      }
      case "22":{
        return "CONDIMENTOS"
      }
      default:{
        return ""
      }
    }
  }

  async function searchProducts(){
    var select = document.getElementById("productSelect");
    var length = select.options.length;
    for (let i = length-1; i >= 0; i--) {
      select.options[i] = null;
    }
    let keyword = document.getElementById("keywordSearch").value
    console.log(keyword)
    if(currentProductsCalculator.length<=0){
      console.log("cur 0")
      let value = await app.database().ref().child(`products`).once("value")
      let prds = Object.values(value.val())
      setCurrentProductsCalculator(prds)
      var x = document.getElementById("productSelect");
      var option = document.createElement("option");
      option.text = "Seleccione un alimento"
      option.value = ""
      x.add(option);
      let filtered = prds.filter(element=>element.nombre.includes(keyword))
      for(let i=0; i<filtered.length; i++){
        option = document.createElement("option");
        option.text = filtered[i].nombre
        option.value = filtered[i].id
        x.add(option);
      }
    }else{
      console.log("cur 1")
      let filtered = currentProductsCalculator.filter(element=>element.nombre.toLowerCase().includes(keyword))
      console.log(currentProductsCalculator)
      var x = document.getElementById("productSelect");
      var option = document.createElement("option");
      option.text = "Seleccione un alimento"
      option.value = ""
      x.add(option);
      for(let i=0; i<filtered.length; i++){
        option = document.createElement("option");
        option.text = filtered[i].nombre
        option.value = filtered[i].id
        x.add(option);
      }
    }
  }

  function addProduct(){
    let quantity = document.getElementById("quantityInput").value
    if(quantity!=="" && currentProductCalculator.id!==undefined){
      let total = 0
      let totalP = 0
      let totalG = 0
      let totalC = 0
      totalP = (Number(currentProductCalculator.proteinas)*Number(quantity)/100)
      totalG = (Number(currentProductCalculator.grasas)*Number(quantity)/100)
      totalC = (Number(currentProductCalculator.carbohidratos)*Number(quantity)/100)
      total = (totalP*4) + (totalG*9) + (totalC*4)
      let rw = [...rows]
      rw.push(createData(currentProductCalculator.id, currentProductCalculator.nombre, Number(quantity), Number(currentProductCalculator.proteinas), Number(currentProductCalculator.grasas), Number(currentProductCalculator.carbohidratos), redondearDosDecimales(total), redondearDosDecimales(totalP), redondearDosDecimales(totalG), redondearDosDecimales(totalC)))
      setRows([...rw])
      var select = document.getElementById("productSelect");
      var length = select.options.length;
      for (let i = length-1; i >= 0; i--) {
        select.options[i] = null;
      }
      document.getElementById("keywordSearch").value = ""
      document.getElementById("quantityInput").value = ""
      setCurrentProductCalculator({})
    }
  }

  function createData(id, name, quantity, protein, fat, carbs, total, totalP, totalG, totalC) {
    return {id, name, quantity, protein, fat, carbs, total, totalP, totalG, totalC};
  }

  function handleModal(id, status){
    document.getElementById(id).style.display = status===true?"block":"none"
  }

  function deleteRow(id){
    let rw = [...rows]
    rw = removeItemOnce(rw, id)
    setRows(rw)
  }

  function removeItemOnce(arr, value) {
    var index = arr.map(element=>element.id).indexOf(value)
    if (index > -1) {
      arr.splice(index, 1)
    }
    return arr
  }

  function currentComponent(){
    switch(currentIndex){
      case 0:{
        return(
          <div className="App-zeroContent">
            <img src={logo1} alt="logo"></img>
            <h4>Este sistema tiene como objetivo ofrecer al área de cocina del Hotel Balandra</h4>
            <h4>una alternativa para poder calcular, de manera rápida y fácil, el aporte calórico</h4>
            <h4>del menú o carta que se ofrece.</h4>
            <div className="App-zeroContentImages">
              <img src={img1}/>
              <img src={img2}/>
              <img src={img3}/>
              <img src={img4}/>
            </div>
          </div>
        )
      }
      case 1:{       
        let ttlKl = 0
        let ttlP = 0
        let ttlG = 0
        let ttlC = 0
        rows.forEach((item)=>{
          ttlKl = redondearDosDecimales(ttlKl + item.total)
          ttlP = redondearDosDecimales(ttlP + item.totalP)
          ttlG = redondearDosDecimales(ttlG + item.totalG)
          ttlC = redondearDosDecimales(ttlC + item.totalC)
        }) 
        return(
          <div className="App-oneContent">
            <h2 className="App-contentTitle">Calculadora de calorías</h2>
            <div className="App-tableContainer">
              <Add className="App-iconButton" onClick={()=>handleModal("App-addProductModal", true)}/>
              <TableContainer className="App-table" component={Paper}>
                <Table size="small" aria-label="a dense table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Nombre</TableCell>
                      <TableCell align="right">Cantidad(gr)</TableCell>
                      <TableCell align="right">Proteínas(gr)</TableCell>
                      <TableCell align="right">Grasas(gr)</TableCell>
                      <TableCell align="right">Carbohidratos(gr)</TableCell>
                      <TableCell align="right">Calorías totales(kcal)</TableCell>
                      <TableCell align="right">Opciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell component="th" scope="row">
                          {row.name}
                        </TableCell>
                        <TableCell align="right">{row.quantity}</TableCell>
                        <TableCell align="right">{row.protein}</TableCell>
                        <TableCell align="right">{row.fat}</TableCell>
                        <TableCell align="right">{row.carbs}</TableCell>
                        <TableCell align="right">{row.total}</TableCell>
                        <Trash className="App-trashIcon" onClick={()=>deleteRow(row.id)}></Trash>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
            <div className="App-resumeContainer">
              <h4>Sumatoria de Calorías: {ttlKl} kcal</h4>
              <TableContainer className="App-table" component={Paper}>
                <Table size="small" aria-label="a dense table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Nombre</TableCell>
                      <TableCell align="right">Calorías(kcal)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell component="th" scope="row">
                          {row.name}
                        </TableCell>
                        <TableCell align="right">{row.total}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
            <div className="App-resumeContainer">
              <h4>Sumatoria de Proteínas: {ttlP} gr</h4>
              <TableContainer className="App-table" component={Paper}>
                <Table size="small" aria-label="a dense table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Nombre</TableCell>
                      <TableCell align="right">Proteínas(gr)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell component="th" scope="row">
                          {row.name}
                        </TableCell>
                        <TableCell align="right">{row.totalP}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
            <div className="App-resumeContainer">
              <h4>Sumatoria de Grasas: {ttlG} gr</h4>
              <TableContainer className="App-table" component={Paper}>
                <Table size="small" aria-label="a dense table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Nombre</TableCell>
                      <TableCell align="right">Grasas(gr)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell component="th" scope="row">
                          {row.name}
                        </TableCell>
                        <TableCell align="right">{row.totalG}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
            <div className="App-resumeContainer">
              <h4>Sumatoria de Carbohidratos: {ttlC} gr</h4>
              <TableContainer className="App-table" component={Paper}>
                <Table size="small" aria-label="a dense table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Nombre</TableCell>
                      <TableCell align="right">Carbohidratos(gr)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell component="th" scope="row">
                          {row.name}
                        </TableCell>
                        <TableCell align="right">{row.totalC}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
            <div className="App-resumeContainer">
              <h4>Resumen General</h4>
              <TableContainer className="App-tableGeneral" component={Paper}>
                <Table size="small" aria-label="a dense table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Nombre</TableCell>
                      <TableCell align="right">Cantidad (gr)</TableCell>
                      <TableCell align="right">Porcentaje</TableCell>
                      <TableCell align="right">Estándar</TableCell>
                      <TableCell align="right">KiloCalorías</TableCell>
                      <TableCell align="right">Porcentaje</TableCell>
                      <TableCell align="right">Estándar</TableCell>
                      <TableCell align="right">Recomendación</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow key="proteinas">
                      <TableCell component="th" scope="row">
                        Proteínas
                      </TableCell>
                      <TableCell align="right">{ttlP}</TableCell>
                      <TableCell align="right">{redondearDosDecimales((ttlP*100)/(ttlP+ttlG+ttlC))}%</TableCell>
                      <TableCell align="right">10% - 20%</TableCell>
                      <TableCell align="right">{redondearDosDecimales(ttlP*4)}</TableCell>
                      <TableCell align="right">{redondearDosDecimales((ttlP*4)*100/((ttlP*4)+(ttlG*9)+(ttlC*4)))}%</TableCell>
                      <TableCell align="right">Máximo 15%</TableCell>
                      <TableCell align="right">{redondearDosDecimales((15-(ttlP*4)*100/((ttlP*4)+(ttlG*9)+(ttlC*4))))>0?`Aumentar ${redondearDosDecimales((15-(ttlP*4)*100/((ttlP*4)+(ttlG*9)+(ttlC*4))))}%`:`Disminuir ${redondearDosDecimales((15-(ttlP*4)*100/((ttlP*4)+(ttlG*9)+(ttlC*4))))}%`}</TableCell>
                    </TableRow>
                    <TableRow key="grasas">
                      <TableCell component="th" scope="row">
                        Grasas
                      </TableCell>
                      <TableCell align="right">{ttlG}</TableCell>
                      <TableCell align="right">{redondearDosDecimales((ttlG*100)/(ttlP+ttlG+ttlC))}%</TableCell>
                      <TableCell align="right">10% - 15%</TableCell>
                      <TableCell align="right">{redondearDosDecimales(ttlG*9)}</TableCell>
                      <TableCell align="right">{redondearDosDecimales((ttlG*9)*100/((ttlP*4)+(ttlG*9)+(ttlC*4)))}%</TableCell>
                      <TableCell align="right">Máximo 25%</TableCell>
                      <TableCell align="right">{redondearDosDecimales((25-(ttlG*9)*100/((ttlP*4)+(ttlG*9)+(ttlC*4))))>0?`Aumentar ${redondearDosDecimales((25-(ttlG*9)*100/((ttlP*4)+(ttlG*9)+(ttlC*4))))}%`:`Disminuir ${redondearDosDecimales((25-(ttlG*9)*100/((ttlP*4)+(ttlG*9)+(ttlC*4))))}%`}</TableCell>
                    </TableRow>
                    <TableRow key="carbohidratos">
                      <TableCell component="th" scope="row">
                        Carbohidratos
                      </TableCell>
                      <TableCell align="right">{ttlC}</TableCell>
                      <TableCell align="right">{redondearDosDecimales((ttlC*100)/(ttlP+ttlG+ttlC))}%</TableCell>
                      <TableCell align="right">65% - 75%</TableCell>
                      <TableCell align="right">{redondearDosDecimales(ttlC*4)}</TableCell>
                      <TableCell align="right">{redondearDosDecimales((ttlC*4)*100/((ttlP*4)+(ttlG*9)+(ttlC*4)))}%</TableCell>
                      <TableCell align="right">Mínimo 60%</TableCell>
                      <TableCell align="right">{redondearDosDecimales((60-(ttlC*4)*100/((ttlP*4)+(ttlG*9)+(ttlC*4))))>0?`Aumentar ${redondearDosDecimales((60-(ttlC*4)*100/((ttlP*4)+(ttlG*9)+(ttlC*4))))}%`:`Disminuir ${redondearDosDecimales((60-(ttlC*4)*100/((ttlP*4)+(ttlG*9)+(ttlC*4))))}%`}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          </div>
        )
      }
      case 2:{
        return(
          <div className="App-twoContent">
            <h4>Formulario para subir alimentos</h4>
            <div className="App-formItem">
              <p>Código</p>
              <input type="text" placeholder="Código" name="codigo" onChange={onInputChange}></input>
            </div>
            <div className="App-formItem">
              <p>Nombre</p>
              <input type="text" placeholder="Nombre" name="nombre" onChange={onInputChange}></input>
            </div>
            <div className="App-formItem">
              <p>Proteínas</p>
              <input type="number" placeholder="Proteínas" name="proteinas" onChange={onInputChange}></input>
            </div>
            <div className="App-formItem">
              <p>Grasas</p>
              <input type="number" placeholder="Grasas" name="grasas" onChange={onInputChange}></input>
            </div>
            <div className="App-formItem">
              <p>Carbohidratos</p>
              <input type="number" placeholder="Carbohidratos" name="carbohidratos" onChange={onInputChange}></input>
            </div>
            <div className="App-formItem">
              <p>Categoría</p>
              <select name="categoria" onChange={onInputChange}>
                <option value="">Seleccione una categoría</option>
                <option value="01">PRODUCTOS LACTEOS Y SIMILARES</option>
                <option value="02">HUEVOS</option>
                <option value="03">CARNE DE AVES</option>
                <option value="04">CARNE DE CERDO</option>
                <option value="05'">CARNE DE VACUNO</option>
                <option value="06">CARNE DE CAZA</option>
                <option value="07">EMBUTIDOS Y SIMILARES</option>
                <option value="08">MARISCOS PESCADOS</option>
                <option value="09">LEGUMINOSAS, GRANOS SECOS Y DERIVADOS</option>
                <option value="10">NUECES Y SEMILLAS</option>
                <option value="11">VERDURAS, HORTALIZAS Y OTROS VEGETALES</option>
                <option value="12">FRUTAS Y JUGOS DE FRUTAS</option>
                <option value="13">CEREALES, GRABOS SECOS, HARINAS Y PASTAS</option>
                <option value="14">GALLETAS, PANES, TORTILLAS Y SIMILARES</option>
                <option value="15">AZUCARES, MIELES, DULCES Y GOLOSINAS</option>
                <option value="16">ACEITES Y GRASAS</option>
                <option value="17">BEBIDAS DIVERSAS</option>
                <option value="18">POSTRES</option>
                <option value="19">COMIDAS INFANTILES</option>
                <option value="20">ADEREZOS, SALSAS Y SOPAS</option>
                <option value="21">COMIDAS PREPARADAS: COMERCIALES Y CASERAS</option>
                <option value="22">CONDIMENTOS</option>
              </select>
            </div>
            <h4>o subir un archivo CSV</h4>
            <CSVReader onFileLoaded={(data, fileInfo) => setProdsData(data)} />
            <br/>
            <button onClick={uploadFile}>Subir datos</button>
          </div>
        )
      }
      case 3:{
        return(
          <div className="App-threeContent">
            <img src={logo1} alt="logo"></img>
            <h4>Este sistema así como sus datos y cálculos, tienen como base bibliográfica los siguientes documentos:</h4>
            <h4>Título: Tabla de composición de alimentos de centroamérica INCAP</h4>
            <h4>Menchú, MT (ed): Méndez, H. (ed). Guatemala: INCAP/OPS 2007. Segunda edición.</h4>
            <h4>ISBN 99922-880-2-7</h4>
            <br/>
            <br/>
            <h4>Título: Ingeniería Nutricional.</h4>
            <h4>Guamialama, J. (s.f.). Imprenta Renacer.</h4>
          </div>
        )
      }
      default:{
        return <h4>Contenido Default</h4>
      }
    }
  }

  function uploadFile(){
    for(let i=1; i<prodsData.length; i++){
      let key = app.database().ref().push().key
      console.log(key)
      let prodObj = {
        id: key,
        codigo: prodsData[i][0],
        nombre: prodsData[i][1],
        proteinas: Number(prodsData[i][2]),
        grasas: Number(prodsData[i][3]),
        carbohidratos: Number(prodsData[i][4]),
        categoria: prodsData[i][5]
      }
      app.database().ref().child(`products/${key}`).set(prodObj)

    }
  }

  function onInputChange(e){
    console.log(e.target.name)
    console.log(e.target.value)
    switch(e.target.name){
      case "codigo":{
        setCurrentProduct({...currentProduct, codigo: e.target.value})
        break
      }
      case "nombre":{
        setCurrentProduct({...currentProduct, nombre: e.target.value})
        break
      }
      case "proteinas":{
        setCurrentProduct({...currentProduct, proteinas: e.target.value})
        break
      }
      case "grasas":{
        setCurrentProduct({...currentProduct, grasas: e.target.value})
        break
      }
      case "carbohidratos":{
        setCurrentProduct({...currentProduct, carbohidratos: e.target.value})
        break
      }
      case "categoria":{
        setCurrentProduct({...currentProduct, categoria: e.target.value})
        break
      }
      default:{
        break
      }
    }
  }
}

export default App;
