import React, { useState } from 'react';
import axios from 'axios';
import { WiThermometer, WiHumidity, WiStrongWind, WiDaySunny, WiCloud, WiRain, WiDayHaze, WiSnow, WiNightClear } from 'react-icons/wi';
import { FaSearch } from 'react-icons/fa';

function App() {
  const [data, setData] = useState({});
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isDaytime, setIsDaytime] = useState(true);
  const [backgroundImage, setBackgroundImage] = useState('');

  const apiKey = 'e5c3fbfb3536df1b3beb032712a82250';
  const pexelsApiKey = 'IiKrOzZY1Tx0AysrNIzLLgVMIfAL1takWeZpHxsZ2lD2NPyaWolXWosY';

  const url = `http://localhost:5000/weather?city=${location}`;

  const fetchSuggestions = (query) => {
    if (query.trim() === '') {
      setSuggestions([]);
      return;
    }

    axios.get(`https://api.openweathermap.org/data/2.5/find?q=${query}&appid=${apiKey}`)
      .then((response) => {
        setSuggestions(response.data.list);
      })
      .catch((error) => {
        console.error('Error fetching city suggestions:', error);
      });
  };

  // hàm lấy hình ảnh thành phố
  const fetchCityImage = (city) => {
    axios.get(`https://api.pexels.com/v1/search?query=${city}&per_page=1`, {
      headers: {
        Authorization: pexelsApiKey
      }
    })
      .then((response) => {
        if (response.data.photos.length > 0) {
          setBackgroundImage(response.data.photos[0].src.landscape);
        }
      })
      .catch((error) => {
        console.error('Error fetching city image:', error);
      });
  };
// hàm tìm kiếm thông tin thời tiết khi bấm nút tìm kiếm
  const searchLocation = () => {
    if (location.trim() === '') {
      setError('Vui lòng nhập tên thành phố');
      setData({}); // xóa kết quả tìm trước đó
    } else {
      axios.get(url)
        .then((response) => {
          setData(response.data);
          setError(''); // xóa lỗi nếu tìm thấy thành phố
          setLocation('');

          // kiểm tra thời gian ban ngày hay ban đêm
          const isDay = checkDaytime(response.data.sys.sunrise, response.data.sys.sunset);
          setIsDaytime(isDay);

          fetchCityImage(response.data.name);
        })
        .catch((error) => {
          // kiểm tra nếu API trả về mã lỗi 404 (Không tìm thấy thành phố)
          if (error.response && error.response.status === 404) {
            setError('Thành phố không tồn tại');
            setData({}); // xóa kết quả tìm trước đó
          } else {
            setError('Có lỗi xảy ra, vui lòng thử lại');
            setData({}); // xóa kết quả tìm trước đó
          }
        });
    }
  };

  const checkDaytime = (sunrise, sunset) => {
    const currentTime = Math.floor(Date.now() / 1000);
    return currentTime >= sunrise && currentTime <= sunset;
  };

  // hàm xử lý thay đổi trong ô input
  const handleInputChange = (event) => {
    const value = event.target.value;
    setLocation(value);
    fetchSuggestions(value); // gọi hàm tìm kiếm gợi ý khi người dùng thay đổi ô input
  };

  // hàm xử lý khi người dùng chọn thành phố từ gợi ý
  const handleSuggestionClick = (city) => {
    setLocation(city.name); //cập nhật ô input với thành phố đã chọn
    setSuggestions([]); // xóa gợi ý sau khi chọn
    fetchCityImage(city.name);
    searchLocation(); // tìm kiếm thông tin thời tiết cho thành phố đã chọn
  };

  const getWeatherIcon = (description) => {
    switch (description) {
      case 'Clear': return <WiDaySunny />;
      case 'Clouds': return <WiCloud />;
      case 'Rain': return <WiRain />;
      case 'Snow': return <WiSnow />;
      case 'Haze': return <WiDayHaze />;
      default: return <WiDaySunny />;
    }
  };

  return (
    <div className="app" style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', minHeight: '100vh' }}>
      <div className="search">
        <input
          value={location}
          onChange={handleInputChange}
          onKeyDown={(event) => event.key === 'Enter' && searchLocation()}
          placeholder="Enter Location"
          type="text"
        />
        <button onClick={searchLocation} className="search-btn">
          <FaSearch />
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* hiển thị danh sách gợi ý thành phố */}
      {suggestions.length > 0 && (
        <div className="suggestions-list">
          {suggestions.map((city, index) => (
            <div
              key={index}
              className="suggestion-item"
              onClick={() => handleSuggestionClick(city)}
            >
              {city.name}, {city.sys.country}
            </div>
          ))}
        </div>
      )}

      <div className="container">
        <div className="top">
          <div className="location">
            <p>{data.name}</p>
          </div>
          <div className="temp">
            {data.main ? <h1>{data.main.temp.toFixed()} °C</h1> : null}
          </div>
          <div className="description">
            {data.weather ? (
              <p>
                {getWeatherIcon(data.weather[0].main)} {data.weather[0].main}
              </p>
            ) : null}
          </div>
        </div>

        {data.name && (
          <div className="bottom">
            <div className="feels">
              {data.main && <p><WiThermometer /> {data.main.feels_like.toFixed()} °C</p>}
              <p>Cảm nhận</p>
            </div>
            <div className="humidity">
              {data.main && <p><WiHumidity /> {data.main.humidity}%</p>}
              <p>Độ ẩm</p>
            </div>
            <div className="wind">
              {data.wind && <p><WiStrongWind /> {data.wind.speed.toFixed()} km/h</p>}
              <p>Gió giật</p>
            </div>
            <div className="day-night">
              <p>{isDaytime ? <WiDaySunny /> : <WiNightClear />}</p>
              <p>{isDaytime ? "Ban ngày" : "Ban đêm"}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
