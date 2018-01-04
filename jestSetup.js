import Enzyme from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import axios from "axios";
import httpAdapter from "axios/lib/adapters/http";

Enzyme.configure({ adapter: new Adapter() });

axios.defaults.adapter = httpAdapter;
