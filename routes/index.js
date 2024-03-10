const router = require("express").Router();
const { farmer_controller } = require("../controller");
//중복체크
router.post("/api/farmer/chk", farmer_controller.ChkDuplicate);
//회원가입
router.post("/api/farmer/signup", farmer_controller.SignUp);
//로그인
router.post("/api/farmer/signin", farmer_controller.SignIn);
//내 상태 및 밭 상태
router.get("/api/farmer/status", farmer_controller.UserStatus);
// 인벤토리
router.get("/api/farmer/inven", farmer_controller.Inventory);
//농작물 심기
router.post("/api/farmer/crops", farmer_controller.Crops);
// 밭 상태 체크, 수확할 수 있는 농작물 보기
router.get("/api/farmer/fam/status", farmer_controller.FarmStatus);
//농작물 수확
router.post("/api/farmer/harvest", farmer_controller.Crop_harvest);
// 상점리스트 (밭, 씨앗)
router.get("/api/farmer/store/list", farmer_controller.Storelist);
// 상점에서 구매 (밭, 씨앗)
router.post("/api/farmer/buyseed", farmer_controller.Buyseed);
//상점에다 판매 (수확물)
router.post("/api/farmer/sellcrop", farmer_controller.Sellcrop);

router.get("/api/token/refresh", farmer_controller.RefreshToken);
//실시간 구매 -> socket
// socket && redis통해서 pubsub

//+ 소켓전에 리프레쉬토큰 로그아웃 redis붙이기
//redis에 리프레쉬토큰 저장과 리프레쉬 토큰으로 엑세스 토큰 재발급하기

//게임 내 로그 수집 몽고디비 (+@)

module.exports = router;
