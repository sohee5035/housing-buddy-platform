import { 
  Shield, 
  ShieldCheck, 
  Crown, 
  Star, 
  Key, 
  Settings, 
  UserCheck, 
  Award, 
  Badge,
  CheckCircle,
  Verified,
  AdminPanelSettings
} from "lucide-react";

export default function AdminIconPreview() {
  const icons = [
    { icon: Shield, name: "Shield", description: "방패 - 보호/권한을 상징" },
    { icon: ShieldCheck, name: "ShieldCheck", description: "체크 방패 - 인증된 관리자" },
    { icon: Crown, name: "Crown", description: "왕관 - 최고 권한" },
    { icon: Star, name: "Star", description: "별 - 특별한 사용자" },
    { icon: Key, name: "Key", description: "열쇠 - 접근 권한" },
    { icon: Settings, name: "Settings", description: "설정 - 관리 기능" },
    { icon: UserCheck, name: "UserCheck", description: "인증된 사용자" },
    { icon: Award, name: "Award", description: "상 - 특별한 지위" },
    { icon: Badge, name: "Badge", description: "뱃지 - 신분증" },
    { icon: CheckCircle, name: "CheckCircle", description: "체크 원 - 확인된 상태" }
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">관리자 뱃지 아이콘 미리보기</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {icons.map(({ icon: Icon, name, description }) => (
          <div key={name} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-center mb-3">
              <div className="flex items-center space-x-2 bg-blue-100 px-3 py-1 rounded-full">
                <Icon className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">관리자</span>
              </div>
            </div>
            <h3 className="font-semibold text-center text-gray-800">{name}</h3>
            <p className="text-sm text-gray-600 text-center mt-1">{description}</p>
            
            {/* 댓글에서 어떻게 보일지 미리보기 */}
            <div className="mt-4 p-3 bg-gray-50 rounded border-l-4 border-blue-400">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium">관</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-gray-900">Housing Buddy</span>
                    <div className="flex items-center space-x-1 bg-blue-100 px-2 py-0.5 rounded-full">
                      <Icon className="h-3 w-3 text-blue-600" />
                      <span className="text-xs font-medium text-blue-800">관리자</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">안녕하세요! 문의사항이 있으시면 언제든 연락주세요.</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2">추천</h3>
        <p className="text-sm text-yellow-700">
          <strong>ShieldCheck</strong> 또는 <strong>Crown</strong>이 관리자 뱃지로 가장 적합해 보입니다. 
          ShieldCheck는 전문적이고 신뢰감을 주고, Crown은 권위있고 눈에 잘 띕니다.
        </p>
      </div>
    </div>
  );
}