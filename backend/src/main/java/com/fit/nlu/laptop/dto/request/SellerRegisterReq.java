package com.fit.nlu.laptop.dto.request;

public record SellerRegisterReq(
        String email,
        String password,
        String fullName,
        String phone,
        String warehouseProvince,
        String warehouseDistrict,
        String warehouseWard,
        String warehouseStreet,
        String cccd,
        String bankName,
        String bankAccountNumber,
        String bankAccountHolder
) {
}
