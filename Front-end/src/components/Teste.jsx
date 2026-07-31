import api from "../services/api";

function Teste(){

    async function adicionar(){

        try {

            const resposta = await api.post("/cart/add", {
                userId: 1,
                productId: 1,
                quantity: 1
            });

            console.log("Produto adicionado:", resposta.data);

        } catch(error){

            console.log(
                "Erro:",
                error.response?.data || error.message
            );

        }

    }


    async function buscar(){

        try {

            const resposta = await api.get("/cart/1");

            console.log("Carrinho:", resposta.data);

        } catch(error){

            console.log(error);

        }

    }


    return (
        <div>

            <h1>Teste API</h1>

            <button onClick={adicionar}>
                Adicionar produto
            </button>

            <button onClick={buscar}>
                Buscar carrinho
            </button>

        </div>
    );
}

export default Teste;