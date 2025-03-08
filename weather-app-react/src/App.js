import React, { useState } from 'react';
import axios from 'axios';
import { WiThermometer, WiHumidity, WiStrongWind, WiDaySunny, WiCloud, WiRain, WiDayHaze, WiSnow, WiNightClear } from 'react-icons/wi';
import { FaSearch } from 'react-icons/fa';

function App() {
  const [data, setData] = useState({});
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);  // State để lưu các gợi ý
  const [isDaytime, setIsDaytime] = useState(true);

  const apiKey = 'e5c3fbfb3536df1b3beb032712a82250';

  const url = `http://localhost:5000/weather?city=${location}`;

  // Hàm tìm kiếm gợi ý thành phố
  const fetchSuggestions = (query) => {
    if (query.trim() === '') {
      setSuggestions([]);
      return;
    }

    axios.get(`https://api.openweathermap.org/data/2.5/find?q=${query}&appid=${apiKey}`)
      .then((response) => {
        setSuggestions(response.data.list);  // Lưu các thành phố tìm được vào state
      })
      .catch((error) => {
        console.error('Error fetching city suggestions:', error);
      });
  };

  // Hàm tìm kiếm thông tin thời tiết khi bấm nút tìm kiếm
  const searchLocation = () => {
    if (location.trim() === '') {
      setError('Vui lòng nhập tên vùng hoặc thành phố bạn muốn tìm');
      setData({});  // Xóa kết quả đã tìm trước đó
    } else {
      axios.get(url)
        .then((response) => {
          setData(response.data);
          setError(''); // Xóa lỗi nếu tìm thấy thành phố
          setLocation('');

          // Kiểm tra thời gian ban ngày hay ban đêm
          const isDay = checkDaytime(response.data.sys.sunrise, response.data.sys.sunset);
          setIsDaytime(isDay);  // Cập nhật trạng thái ban ngày hay ban đêm
        })
        .catch((error) => {
          // Kiểm tra nếu API trả về mã lỗi 404 (Không tìm thấy thành phố)
          if (error.response && error.response.status === 404) {
            setError('Thành phố này không tồn tại');
            setData({});  // Xóa kết quả đã tìm trước đó
          } else {
            setError('Thành phố này không tồn tại, vui lòng nhập đúng tên!');
            setData({});  // Xóa kết quả đã tìm trước đó
          }
        });
    }
  };

  // Hàm kiểm tra xem đó là ban ngày hay ban đêm
  const checkDaytime = (sunrise, sunset) => {
    const currentTime = Math.floor(Date.now() / 1000);  // Thời gian hiện tại tính bằng giây
    return currentTime >= sunrise && currentTime <= sunset;  // Nếu hiện tại nằm trong khoảng từ sunrise đến sunset thì là ban ngày
  };

   // Hàm xử lý thay đổi trong ô input
   const handleInputChange = (event) => {
    const value = event.target.value;
    setLocation(value);
    fetchSuggestions(value);  // Gọi hàm tìm kiếm gợi ý khi người dùng thay đổi ô input
  };

  // Hàm xử lý khi người dùng chọn thành phố từ gợi ý
  const handleSuggestionClick = (city) => {
    setLocation(city.name);  // Cập nhật ô input với thành phố đã chọn
    setSuggestions([]);  // Xóa gợi ý sau khi chọn
    searchLocation();  // Tìm kiếm thông tin thời tiết cho thành phố đã chọn
  };
  

  const getWeatherIcon = (description) => {
    switch (description) {
      case 'Clear':
        return <WiDaySunny />;
      case 'Clouds':
        return <WiCloud />;
      case 'Rain':
        return <WiRain />;
      case "Snow":
        return <WiSnow />;  
      case "Haze":
        return<WiDayHaze />;
      default:
        return <WiDaySunny />;
    }
  };

  return (
    <div className="app">
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

      {/* Hiển thị danh sách gợi ý thành phố */}
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

        {data.name !== undefined && (
          <div className="bottom">
            <div className="feels">
              {data.main ? (
                <p className="bold">
                  <WiThermometer /> {data.main.feels_like.toFixed()} °C
                </p>
              ) : null}
              <p>Cảm nhận</p>
            </div>
            <div className="humidity">
              {data.main ? (
                <p className="bold">
                  <WiHumidity /> {data.main.humidity}%
                </p>
              ) : null}
              <p>Độ ẩm</p>
            </div>
            <div className="wind">
              {data.wind ? (
                <p className="bold">
                  <WiStrongWind /> {data.wind.speed.toFixed()} km/h
                </p>
              ) : null}
              <p>Gió giật</p>
            </div>
            <div className="day-night">
              <p>{isDaytime ? <WiDaySunny /> : <WiNightClear />}</p>
              <p>{isDaytime ? "Ban ngày" : "Ban đêm"}</p>  {/* Hiển thị trạng thái ban ngày hay ban đêm */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;