import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import { ProductsContext } from '../context/ProductsProvider';

function Checkout() {
  const { cart, totalValue, setCart, setTotalValue } = useContext(ProductsContext);
  const [form, setForm] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [theSeller, setTheSeller] = useState(sellers[0]);

  const getSellers = async () => {
    try {
      const api = axios.create({
        baseURL: 'http://localhost:3001',
      });
      const { data } = await api.get('/sales/seller');
      setSellers(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(getSellers, []);

  const history = useHistory();
  const { token, id } = JSON.parse(localStorage.getItem('user')) || '';

  const handleRemoveItem = (itemId) => {
    const updatedOrder = cart.filter((item) => item.id !== itemId);

    setTotalValue(Number(totalValue)
      .toFixed(2).replace('.', ','));

    setCart(updatedOrder);

    const reduce = updatedOrder
      .reduce((acc, curr) => acc + curr.price * curr.qtd, 0)
      .toFixed(2);
    setTotalValue(reduce);
  };

  function handleChange({ target }) {
    const { name, value } = target;
    setForm({ ...form, [name]: value });
  }

  const handleSeller = ({ target }) => {
    setTheSeller(target.value);
  };

  async function handleSubmitForm(event) {
    event.preventDefault();
    const createSale = async () => {
      const productsSend = cart.map(
        (product) => ({
          quantity: product.qtd,
          id: product.id,
        }),
      );
      const newSale = {
        userId: id,
        sellerId: theSeller,
        deliveryAddress: form.address,
        deliveryNumber: form.number,
        totalPrice: totalValue,
        products: productsSend,
      };
      const api = axios.create({
        baseURL: 'http://localhost:3001',
      });
      const headers = { headers: { authorization: token } };
      const { data } = await api.post('/sales/register', newSale, headers);
      history.push(`/customer/orders/${data.id}`);
    };
    await createSale();
  }

  const headers = ['Item',
    'Descrição', 'Quantidade', 'Valor Unitário', 'Sub-total', 'Remover Item'];

  return (
    <div>
      <h1>Finalizar Pedido</h1>
      <table>
        <thead>
          <tr>
            {
              headers.map((header) => (<th key={ header }>{ header }</th>))
            }
          </tr>
        </thead>
        <tbody>
          {cart.map((item, i) => (
            <tr key={ i }>
              <td
                data-testid={
                  `customer_checkout__element-order-table-item-number-${i}`
                }
              >
                {i + 1}
              </td>
              <td
                data-testid={ `customer_checkout__element-order-table-name-${i}` }
              >
                {item.name}

              </td>
              <td
                data-testid={ `customer_checkout__element-order-table-quantity-${i}` }
              >
                {item.qtd}

              </td>
              <td
                data-testid={ `customer_checkout__element-order-table-unit-price-${i}` }
              >
                {Number(item.price)
                  .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}

              </td>
              <td
                data-testid={ `customer_checkout__element-order-table-sub-total-${i}` }
              >
                {Number((item.price * item.qtd)
                  .toFixed(2))
                  .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}

              </td>
              <button
                type="button"
                data-testid={ `customer_checkout__element-order-table-remove-${i}` }
                onClick={ () => handleRemoveItem(item.id) }
              >
                Remover

              </button>
            </tr>
          ))}
        </tbody>
      </table>

      <div>
        <p data-testid="customer_checkout__element-order-total-price">
          {Number(totalValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
        <span>Detalhes e Endereço de Entrega</span>
        <label htmlFor="seller">
          P.Vendedora Responsável
          <select
            id="seller"
            name="seller"
            value={ theSeller }
            onChange={ handleSeller }
            data-testid="customer_checkout__select-seller"
          >
            {sellers.map((seller) => (
              <option value={ seller.id } key={ seller.id }>{seller.name}</option>
            ))}
          </select>
        </label>
        <form onSubmit={ (e) => handleSubmitForm(e) }>
          <label htmlFor="address">
            Endereço
            <input
              type="text"
              id="address"
              name="address"
              value={ form.address }
              onChange={ handleChange }
              placeholder="Digite o endereço"
              data-testid="customer_checkout__input-address"
            />
          </label>
          <label htmlFor="number">
            Número
            <input
              type="text"
              id="number"
              name="number"
              value={ form.number }
              onChange={ handleChange }
              placeholder="Digite o número"
              data-testid="customer_checkout__input-address-number"
            />
          </label>
          <button
            data-testid="customer_checkout__button-submit-order"
            type="submit"
            onClick={ handleSubmitForm }
          >
            FINALIZAR PEDIDO
          </button>
        </form>
      </div>
    </div>
  );
}

export default Checkout;
