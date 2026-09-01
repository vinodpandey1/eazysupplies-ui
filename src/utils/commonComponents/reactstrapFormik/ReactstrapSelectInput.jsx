import useOutsideDropdown from "@/utils/hooks/useOutsideDropdown";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import { Fragment, useEffect, useMemo, useState } from "react";
import { RiCloseLine } from "react-icons/ri";
import { Col, FormFeedback, Input, Label } from "reactstrap";

const ReactstrapSelectInput = ({ field, form: { touched, errors, setFieldValue }, getValuesKey = "id", multiple = false, setvalue, ...props }) => {
  const { t } = useTranslation("common");
  const [searchInput, setSearchInput] = useState();
  const [selectedItems, setSelectedItems] = useState();
  const [list, setList] = useState([]);
  const { ref, isComponentVisible, setIsComponentVisible } = useOutsideDropdown();
  let error = errors[field.name];
  let touch = touched[field.name];
  const options = useMemo(
    () => Array.isArray(props?.inputprops?.options) ? props.inputprops.options : [],
    [props?.inputprops?.options]
  );

  // Options commonly arrive after an API request. Keep the dropdown list in
  // sync instead of permanently retaining the empty first-render value.
  useEffect(() => {
    setList(options);
    if (searchInput) {
      if (props.inputprops?.setsearch) {
        props.inputprops?.setsearch(searchInput);
      } else {
        setList(options.filter((item) => item?.name?.toLowerCase().includes(searchInput.toLowerCase())));
      }
    } else {
      props.inputprops?.setsearch && props.inputprops?.setsearch(searchInput);
    }
  }, [options, searchInput]);
  // Memorized the value and update on option changes
  const listOpt = options;
  const visibleOptions = props.inputprops?.setsearch ? listOpt : list;
  useEffect(() => {
    setSearchInput();
    setList(options);
  }, [isComponentVisible, options]);
  // Selecting Values from dropdown
  const onSelectValue = (option) => {
    if (multiple && Array.isArray(field?.value)) {
      const temp = [...selectedItems];
      const index = temp.findIndex((elem) => elem[getValuesKey] == option[getValuesKey]);
      if (index !== -1) {
        temp.splice(index, 1);
      } else {
        temp.push(option);
      }
      setSelectedItems(temp);
      setFieldValue(
        field?.name,
        temp.map((elem) => elem[getValuesKey])
      );
    } else {
      setIsComponentVisible(false);
      const valueToSet = props.store === "obj" ? option : option.id;
      const { inputprops, index, title } = props;
      setSelectedItems(option);
      setvalue ? setvalue(inputprops.name, valueToSet, index, title) : setFieldValue(inputprops.name, valueToSet, index);
    }
  };
  useEffect(() => {
    // Setting variables for type Array data
    if (props.inputprops?.setsearch) {
      Array.isArray(field?.value) && setSelectedItems && setSelectedItems(listOpt.filter((elem) => field?.value?.includes(elem[getValuesKey])));
    } else {
      Array.isArray(field?.value) && setSelectedItems && setSelectedItems(list.filter((elem) => field?.value?.includes(elem[getValuesKey])));
    }
    // Setting variables for type String data
    if (props.inputprops?.setsearch) {
      !Array.isArray(field?.value) && setSelectedItems && setSelectedItems(listOpt.find((elem) => field?.value == elem[getValuesKey]));
    } else {
      !Array.isArray(field?.value) && setSelectedItems && setSelectedItems(list.find((elem) => field?.value == elem[getValuesKey]));
    }
  }, [field?.value, list, listOpt, getValuesKey, props.inputprops?.setsearch]);

  const RemoveSelectedItem = (id, item) => {
    if (props?.inputprops?.close) {
      setSelectedItems("");
      setFieldValue(field.name, "");
    } else {
      let temp = field.value;
      if (temp.length > 0) {
        temp?.splice(temp.indexOf(id), 1);
        setFieldValue(field.name, temp);
      }
    }
  };
  return (
    <>
      {props.label && (
        <Label htmlFor={props.inputprops.id}>
          {props.label}
        </Label>
      )}
      <Col xs={12} className="custom-box">
        <div className="custom-select-box cursor-pointer" ref={ref}>
          {Array.isArray(selectedItems) ? (
            <div className={`category-select-box`} onClick={() => setIsComponentVisible((p) => p !== field?.name && field?.name)}>
              <div className={`bootstrap-tagsinput form-select`}>
                {selectedItems.length > 0 ? (
                  selectedItems?.map((item, i) => (
                    <span className="tag label label-info" key={i}>
                      {item?.name}
                      <a className="ms-2 text-white">
                        <RiCloseLine
                          onClick={(e) => {
                            e.stopPropagation();
                            RemoveSelectedItem(item[getValuesKey], item);
                            setSelectedItems((p) => p.filter((elem) => elem[getValuesKey] !== item[getValuesKey]));
                          }}
                        />
                      </a>
                    </span>
                  ))
                ) : (
                  <span>{t("Select")}</span>
                )}
              </div>
            </div>
          ) : (
            <Input type="text" className="form-select cursor position-absolute" value={t(setvalue !== undefined ? props.inputprops.value || selectedItems?.name : props.inputprops?.options?.find((item) => item.id === field.value)?.name) || t("Select")} onClick={() => setIsComponentVisible(true)} readOnly invalid={Boolean(touched[field.name] && errors[field.name])} />
          )}
          {!Array.isArray(selectedItems) && <Input id={props.inputprops.id} {...field} {...props} placeholder="Search" className="form-control form-select" type="text" invalid={Boolean(touched[field.name] && errors[field.name])} disabled />}
          <p className="help-text">{props?.inputprops?.helpertext}</p>
          {visibleOptions.length > 0 && (
              <div className={`box-content custom-select ${isComponentVisible ? "open" : ""}`}>
                <Input type="text" className="form-control" value={searchInput || ""} onChange={(e) => setSearchInput(e.target.value)} />
                <ul className="intl-tel-input">
                  {visibleOptions.map((option, index) => (
                    <Fragment key={index}>
                      {option?.data ? (
                        <li
                          onClick={() => {
                            setIsComponentVisible(false);
                            setvalue ? setvalue(props.inputprops.name, props.store === "obj" ? option : option.id, props.index, props?.title) : setFieldValue(props.inputprops.name, props.store === "obj" ? option : option.id, props.index);
                          }}
                        >
                          <div className="country">
                            <div className="flag-box">
                              <div className={`iti-flag ${option?.data?.class}`}></div>
                            </div>
                            <span className="dial-code">{option?.data?.code}</span>
                          </div>
                        </li>
                      ) : (
                        <li onClick={() => onSelectValue(option)}>
                          {option?.image && <Image src={option?.image} className="img-fluid category-image" alt={option?.name} height={50} width={50} />}
                          <p className={`cursor ${(selectedItems?.[index]?.[getValuesKey] || selectedItems?.[getValuesKey]) == option[getValuesKey] ? "selected" : ""}`}>{t(option.name)}</p>
                        </li>
                      )}
                    </Fragment>
                  ))}
                </ul>
              </div>
            )}
          {touch && error && (
            <FormFeedback>
              {t(props.title)} {t("IsRequired")}
            </FormFeedback>
          )}
          {props?.inputprops?.close && (
            <div className="close-icon">
              <RiCloseLine onClick={() => RemoveSelectedItem()} />
            </div>
          )}
        </div>
      </Col>
    </>
  );
};
export default ReactstrapSelectInput;
