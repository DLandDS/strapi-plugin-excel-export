import {
    Button,
    Flex,
  } from "@strapi/design-system";
import React, { useState, useRef } from "react";
import { FilterListURLQuery, FilterPopoverURLQuery } from "@strapi/helper-plugin";
import { Filter as FilterIcon } from '@strapi/icons';

export default function Filter(props) {
  const [isVisible, setIsVisible] = useState(false);
  const handleToggle = () => {
    setIsVisible((prev) => !prev);
  };
  const buttonRef = useRef();

  const schema = props.schema;

  return (
    <Flex>
        <Button 
            variant="tertiary" 
            onClick={handleToggle} 
            size="L" 
            ref={buttonRef}
            startIcon={<FilterIcon />}
        >
            Filters
        </Button>
        <FilterPopoverURLQuery
            displayedFilters={schema}
            isVisible={isVisible}
            onToggle={handleToggle}
            source={buttonRef}
        />
        <FilterListURLQuery filtersSchema={schema} />
    </Flex>
  );
}