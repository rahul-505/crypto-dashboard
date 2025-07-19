import { FixedSizeList as List } from 'react-window';
import PriceChart from './PriceChart';

const CryptoTable = ({ data, loading }) => {
  const Row = ({ index, style }) => {
    const coin = data[index];
    return (
      <div style={style} className="table-row">
        <div>{coin.name}</div>
        <div>${coin.current_price.toLocaleString()}</div>
        <div className={coin.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}>
          {coin.price_change_percentage_24h.toFixed(2)}%
        </div>
        <PriceChart coinId={coin.id} />
      </div>
    );
  };

  return (
    <div className="crypto-table">
      {loading ? (
        <div>Loading...</div>
      ) : (
        <List
          height={600}
          itemCount={data.length}
          itemSize={60}
          width="100%"
        >
          {Row}
        </List>
      )}
    </div>
  );
};

export default CryptoTable;