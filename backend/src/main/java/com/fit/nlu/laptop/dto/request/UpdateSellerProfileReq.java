package com.fit.nlu.laptop.dto.request;

public record UpdateSellerProfileReq(
        String storeName,
        String warehouseProvince,
        String warehouseDistrict,
        String warehouseWard,
        String warehouseStreet,
        String bankName,
        String bankAccountNumber,
        String bankAccountHolder,
        Double rating
) {}
