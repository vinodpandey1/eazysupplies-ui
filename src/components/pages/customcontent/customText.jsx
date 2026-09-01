
const CustomText = ( {data} ) => {  
  return (
      <div className="mt-4 policy-document">
        <div dangerouslySetInnerHTML={{ __html: data? data : 'na' }} />
      </div>
  );
};

export default CustomText;
