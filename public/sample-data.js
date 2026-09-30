(() => {
  'use strict';

  const SAMPLE_MEMBER_COUNT = 168;
  const SAMPLE_GENERATION_COUNTS = [1,3,6,12,24,36,42,44];
  const SAMPLE_YEAR = 2026;
  const middleNames = ['Văn','Hữu','Đức','Minh','Gia','Quang','Xuân','Đình','Trọng','Hoàng','Thanh','Công','Ngọc','Bảo'];
  const givenNames = ['An','Bình','Cường','Dũng','Đức','Hùng','Khang','Khánh','Long','Minh','Nam','Phúc','Quân','Sơn','Thành','Tuấn','Vinh','Bảo','Châu','Duy','Hải','Hiếu','Huy','Kiên','Lâm','Lộc','Nghĩa','Phong','Tâm','Trí'];
  const occupations = ['Nông nghiệp','Giáo viên','Thợ mộc','Kinh doanh','Kỹ sư','Y tế','Công chức','Thương mại','Dệt may','Kiến trúc','Kế toán','Cơ khí'];
  const hometowns = ['Gia Định','Sài Gòn','Chợ Lớn','Bình Chánh','Tân Bình','Hóc Môn','Củ Chi','Long An'];
  const preferredIds = ['pv-001','pv-002','pv-003','pv-005','pv-006','pv-007','pv-011','pv-012','pv-015','pv-016'];
  const preferredGeneration = [1,2,2,3,4,5,6,7,8,8];

  const pad = n => String(n).padStart(2,'0');
  const iso = (y,m,d) => `${y}-${pad(m)}-${pad(d)}`;
  const clone = value => JSON.parse(JSON.stringify(value));

  function buildSampleData(){
    const members=[];
    let serial=0;
    const idsByGeneration=[];
    const preferredByGeneration = new Map();
    preferredIds.forEach((id,i)=>{
      const g=preferredGeneration[i];
      if(!preferredByGeneration.has(g)) preferredByGeneration.set(g,[]);
      preferredByGeneration.get(g).push(id);
    });

    SAMPLE_GENERATION_COUNTS.forEach((count,gIndex)=>{
      const generation=gIndex+1;
      const generationIds=[];
      const previous=idsByGeneration[gIndex-1]||[];
      const preferred=[...(preferredByGeneration.get(generation)||[])];
      const baseYears=[1848,1875,1902,1929,1956,1983,2006,2020];
      for(let i=0;i<count;i++){
        serial++;
        const id=preferred.shift()||`demo-${String(serial).padStart(3,'0')}`;
        const middle=middleNames[Math.floor((serial-1)/givenNames.length)%middleNames.length];
        const given=givenNames[(serial-1)%givenNames.length];
        const name=serial===1?'Phạm Văn Tổ':`Phạm ${middle} ${given}`;
        const month=((serial*5+generation*2)%12)+1;
        const day=((serial*7+generation)%28)+1;
        const birthYear=baseYears[gIndex]+(i%Math.max(1,Math.min(18,count)));
        const birthDate=iso(birthYear,month,day);
        const deceased = generation<=4 || (generation===5 && i%4===0) || (generation===6 && i%13===0);
        const deathYear=deceased?Math.min(2025,birthYear+62+((serial*3)%19)):null;
        const deathDate=deathYear?iso(deathYear,((month+4-1)%12)+1,((day+9-1)%28)+1):'';
        const parentId=generation===1?null:previous[i%previous.length];
        const gender=serial%3===0?'Nữ':'Nam';
        const spouse=serial===1?'Phạm Thị Từ':`${serial%2===0?'Nguyễn':'Trần'} ${serial%3===0?'Thị':'Văn'} ${givenNames[(serial+9)%givenNames.length]}`;
        const role=serial===1?'Thủy tổ':generation===2&&i===0?'Trưởng chi':generation===3&&i===0?'Tộc trưởng':'';
        members.push({
          id,name,generation,parentId,role,gender,birthDate,deathDate,spouse,
          hometown:hometowns[(serial+generation)%hometowns.length],
          occupation:occupations[(serial*2+generation)%occupations.length],
          note:`Dữ liệu mẫu · Đời ${generation} · ${deceased?'Đã mất':'Còn sống'} · Nhánh ${String((i%8)+1).padStart(2,'0')}`,
          sample:true
        });
        generationIds.push(id);
      }
      idsByGeneration.push(generationIds);
    });

    if(members.length!==SAMPLE_MEMBER_COUNT) throw new Error(`Sample member count mismatch: ${members.length}`);

    const events=[];
    members.forEach((member,index)=>{
      const [,birthMonth,birthDay]=member.birthDate.split('-');
      events.push({
        id:`sample-birthday-${member.id}`,
        type:'birthday',
        memberId:member.id,
        title:`Sinh nhật · ${member.name}`,
        date:`${SAMPLE_YEAR}-${birthMonth}-${birthDay}`,
        originalDate:member.birthDate,
        recurring:true,
        note:`Ngày sinh ${member.birthDate} · ${member.role||`Đời thứ ${member.generation}`}`,
        sample:true
      });
      if(member.deathDate){
        const [,deathMonth,deathDay]=member.deathDate.split('-');
        events.push({
          id:`sample-memorial-${member.id}`,
          type:'memorial',
          memberId:member.id,
          title:`Giỗ kỵ · ${member.name}`,
          date:`${SAMPLE_YEAR}-${deathMonth}-${deathDay}`,
          originalDate:member.deathDate,
          recurring:true,
          note:`Ngày mất ${member.deathDate} · Tưởng niệm hằng năm`,
          sample:true
        });
      }
    });

    const clanEvents=[
      ['Họp họ đầu năm','2026-02-22','Tổng kết năm cũ, kế hoạch hoạt động dòng họ.'],
      ['Lễ tưởng niệm Thủy tổ','2026-03-18','Dâng hương và đọc gia phả tại từ đường.'],
      ['Ngày thanh minh','2026-04-05','Tảo mộ và chăm sóc phần mộ tổ tiên.'],
      ['Gặp mặt con cháu đời 5','2026-05-17','Kết nối các nhánh gia đình.'],
      ['Cập nhật gia phả quý II','2026-06-28','Bổ sung sinh, mất, hôn phối và nơi cư trú.'],
      ['Khuyến học dòng họ','2026-07-19','Ghi nhận thành tích học tập của con cháu.'],
      ['Ngày gia đình','2026-08-16','Sinh hoạt gia đình và chụp ảnh lưu niệm.'],
      ['Gặp mặt trưởng các chi','2026-09-13','Rà soát thông tin từng nhánh.'],
      ['Cập nhật tư liệu cổ','2026-10-11','Số hóa ảnh, giấy tờ và gia phả giấy.'],
      ['Lễ hiệp kỵ','2026-11-08','Tưởng niệm các bậc tiền nhân.'],
      ['Tổng kết hoạt động năm','2026-12-06','Tổng hợp dữ liệu và kế hoạch năm sau.'],
      ['Ngày truyền thống họ Phạm Văn','2026-12-27','Sinh hoạt truyền thống toàn gia đình.']
    ];
    clanEvents.forEach((row,i)=>events.push({id:`sample-clan-${pad(i+1)}`,type:'clan',title:row[0],date:row[1],note:row[2],recurring:i===1||i===2||i===9||i===11,sample:true}));

    const documents=[];
    const docTitles=[
      'Lời tựa gia phả','Nguồn gốc dòng họ','Quy ước ghi chép gia phả','Sơ đồ các chi','Danh sách trưởng chi','Ghi chép về Thủy tổ',
      'Lịch sử nơi lập nghiệp','Tư liệu từ đường','Danh sách phần mộ tổ tiên','Quy ước ngày giỗ','Sổ khuyến học','Hình ảnh gia đình xưa',
      'Các nghề truyền thống','Chuyện kể đời thứ 3','Chuyện kể đời thứ 4','Biên bản họp họ','Danh sách người cao tuổi','Danh sách con cháu xa quê',
      'Tư liệu hôn phối','Ghi chép di cư','Bản ghi lễ hiệp kỵ','Danh mục ảnh đã số hóa','Hướng dẫn bổ sung thành viên','Kế hoạch bảo tồn gia phả'
    ];
    docTitles.forEach((title,i)=>documents.push({
      id:`sample-doc-${pad(i+1)}`,
      title,
      content:`Tư liệu mẫu số ${i+1}. Nội dung dùng để kiểm thử chức năng lưu trữ, tìm đọc và chỉnh sửa tư liệu của hệ thống Gia phả họ Phạm Văn. Tài liệu liên quan đến đời ${(i%8)+1}, nhánh ${(i%8)+1}.`,
      category:i<6?'Gia phả':i<12?'Nghi lễ':i<18?'Ký ức':'Lưu trữ',
      sample:true
    }));

    return {
      schemaVersion:1,
      source:'Sample workspace · 168 thành viên',
      family:{name:'Gia phả họ Phạm Văn · Dữ liệu mẫu',shortName:'Họ Phạm Văn',motto:'Gìn giữ cội nguồn · Kết nối thế hệ'},
      account:{id:'pham-van-family-sample',user:'sample-workspace',name:'Gia phả họ Phạm Văn · Dữ liệu mẫu'},
      members,events,documents,
      meta:{sample:true,isolated:true,memberCount:members.length,generationCount:SAMPLE_GENERATION_COUNTS.length,eventCount:events.length,documentCount:documents.length,createdFor:'Kiểm thử đầy đủ chức năng; không trộn dữ liệu chính.'}
    };
  }

  window.PHAM_VAN_SAMPLE_DATA = buildSampleData;

  function collapseSettings(){
    document.querySelectorAll('#settings-view details.settings-group').forEach(group=>group.open=false);
  }

  function installSampleControls(){
    collapseSettings();
    const settingsView=document.getElementById('settings-view');
    if(!settingsView||document.getElementById('sample-data-controls')) return;
    const groups=[...settingsView.querySelectorAll('details.settings-group')];
    const dataGroup=groups.find(group=>group.textContent.includes('Cài đặt dữ liệu'));
    const body=dataGroup?.querySelector('.settings-group-body');
    if(!body) return;

    const Store=window.PhamVanStore;
    const sampleExists=Boolean(Store?.sampleExists?.());
    const active=Store?.workspace?.()==='sample';
    const section=document.createElement('section');
    section.className='settings-subsection';
    section.id='sample-data-controls';
    section.innerHTML=`<h3>Dữ liệu mẫu</h3><div class="cloud-status" id="sampleDataStatus">${active?'Đang dùng dữ liệu mẫu · 168 thành viên · 8 đời':sampleExists?'Đã có dữ liệu mẫu · dữ liệu chính vẫn an toàn':'Chưa khởi tạo dữ liệu mẫu'}</div><div class="cloud-actions"><button class="ui-button secondary-button" id="createSampleData">Khởi tạo dữ liệu mẫu</button><button class="ui-button secondary-button danger" id="deleteSampleData" ${sampleExists?'':'disabled'}>Xóa dữ liệu mẫu</button></div><p class="page-sub">Dữ liệu mẫu dùng vùng lưu trữ riêng. Khởi tạo, chỉnh sửa hoặc xóa dữ liệu mẫu không thay đổi dữ liệu chính.</p>`;
    body.prepend(section);

    document.getElementById('createSampleData')?.addEventListener('click',()=>{
      try{
        Store.createSampleData();
        location.reload();
      }catch(error){
        document.getElementById('sampleDataStatus').textContent=error.message||'Không thể khởi tạo dữ liệu mẫu';
      }
    });
    document.getElementById('deleteSampleData')?.addEventListener('click',()=>{
      Store.deleteSampleData();
      location.reload();
    });

    if(active){
      document.body.dataset.workspace='sample';
      const sourceSmall=document.querySelector('#overview-view .source-status .status-copy small');
      if(sourceSmall) sourceSmall.textContent='Dữ liệu mẫu độc lập · Không ảnh hưởng dữ liệu chính.';
      const sourcePill=document.querySelector('#overview-view .source-status .status-pill');
      if(sourcePill) sourcePill.textContent='MẪU';
    }

    document.querySelector('[data-nav="settings"]')?.addEventListener('click',collapseSettings,true);
    document.getElementById('accountButton')?.addEventListener('click',collapseSettings,true);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',installSampleControls,{once:true});
  else installSampleControls();
})();